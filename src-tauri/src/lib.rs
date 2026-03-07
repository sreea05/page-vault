use std::fs;
use std::path::{Path, PathBuf};

fn collect_html_files(
    base: &Path,
    current: &Path,
    html_files: &mut Vec<String>,
) -> Result<(), std::io::Error> {
    for entry in fs::read_dir(current)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            collect_html_files(base, &path, html_files)?;
        } else if path.extension().map(|e| e == "html").unwrap_or(false) {
            html_files.push(
                path.strip_prefix(base)
                    .unwrap()
                    .to_string_lossy()
                    .to_string(),
            );
        }
    }
    Ok(())
}

#[tauri::command]
fn get_html_files(base_path: String) -> Result<Vec<String>, String> {
    let mut html_files = Vec::new();
    let base = PathBuf::from(&base_path);
    if !base.exists() {
        return Err("Base path does not exist".into());
    }
    collect_html_files(&base, &base, &mut html_files).map_err(|e| e.to_string())?;
    Ok(html_files)
}

/// Percent-decode a URI path component (e.g. `%2Fhome%2Fuser%2Ffile.html` → `/home/user/file.html`).
///
/// Invalid percent-escape sequences are passed through unchanged (the `%` byte is
/// emitted literally), which is standard lenient-decoder behaviour.  Since `encoded`
/// is always valid UTF-8 (it came from a `&str`), the `from_utf8` call on the two
/// ASCII hex-digit bytes can never fail in practice.
fn decode_uri_path(encoded: &str) -> String {
    let bytes = encoded.as_bytes();
    let mut result: Vec<u8> = Vec::with_capacity(encoded.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' && i + 2 < bytes.len() {
            let hex = std::str::from_utf8(&bytes[i + 1..i + 3]).unwrap_or("");
            if let Ok(byte) = u8::from_str_radix(hex, 16) {
                result.push(byte);
                i += 3;
                continue;
            }
        }
        result.push(bytes[i]);
        i += 1;
    }
    String::from_utf8_lossy(&result).into_owned()
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        // Serve HTML files through a custom URI scheme so the WebView loads them
        // directly without transferring content over IPC — eliminates the bottleneck
        // of JSON-serialising large files through Tauri's invoke channel.
        .register_uri_scheme_protocol("pagevault", |_app, req| {
            // convertFileSrc(path, "pagevault") produces:
            //   Linux/macOS: pagevault://localhost/{encodeURIComponent(path)}
            //   Windows:     https://pagevault.localhost/{encodeURIComponent(path)}
            // req.uri().path() gives the raw (still percent-encoded) path segment,
            // e.g. "/%2Fhome%2Fuser%2Ffile.html".  Strip the leading "/" then decode.
            let raw_path = req.uri().path();
            let decoded = decode_uri_path(raw_path.trim_start_matches('/'));
            let file_path = PathBuf::from(&decoded);

            // Reject any path that attempts to escape with parent-directory components
            // (e.g. `../../etc/passwd` after decoding).
            if file_path
                .components()
                .any(|c| c == std::path::Component::ParentDir)
            {
                return tauri::http::Response::builder()
                    .status(403)
                    .body(Vec::new())
                    .unwrap();
            }

            match fs::read(&file_path) {
                Ok(body) => tauri::http::Response::builder()
                    .header("Content-Type", "text/html; charset=utf-8")
                    .body(body)
                    .unwrap(),
                Err(e) => {
                    let status = match e.kind() {
                        std::io::ErrorKind::NotFound => 404,
                        std::io::ErrorKind::PermissionDenied => 403,
                        _ => 500,
                    };
                    tauri::http::Response::builder()
                        .status(status)
                        .body(Vec::new())
                        .unwrap()
                }
            }
        })
        .invoke_handler(tauri::generate_handler![get_html_files])
        .run(tauri::generate_context!())
        .expect("error running tauri");
}
