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

#[tauri::command]
fn read_html_file(base_path: String, relative_path: String) -> Result<String, String> {
    let full_path = PathBuf::from(base_path).join(relative_path);
    fs::read_to_string(full_path).map_err(|e| e.to_string())
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_html_files, read_html_file])
        .run(tauri::generate_context!())
        .expect("error running tauri");
}
