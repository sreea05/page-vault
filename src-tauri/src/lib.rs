use serde::Serialize;
use std::path::{Path, PathBuf};

#[derive(Serialize)]
pub struct FileNode {
    id: String,
    name: String,
    path: String,
    children: Option<Vec<FileNode>>,
}

fn build_tree(path: &Path) -> Vec<FileNode> {
    let mut nodes: Vec<FileNode> = Vec::new();

    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries.flatten() {
            let entry_path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();

            if entry_path.is_dir() {
                let children = build_tree(&entry_path);
                if !children.is_empty() {
                    nodes.push(FileNode {
                        id: entry_path.to_string_lossy().to_string(),
                        name,
                        path: entry_path.to_string_lossy().to_string(),
                        children: Some(children),
                    });
                }
            } else if entry_path.extension().and_then(|e| e.to_str()) == Some("html") {
                nodes.push(FileNode {
                    id: entry_path.to_string_lossy().to_string(),
                    name,
                    path: entry_path.to_string_lossy().to_string(),
                    children: None,
                });
            }
        }
    }

    nodes
}

#[tauri::command]
fn get_html_tree(base_path: String) -> Result<Vec<FileNode>, String> {
    let path = PathBuf::from(base_path);

    if !path.exists() {
        return Err("Path does not exist".into());
    }

    Ok(build_tree(&path))
}

#[tauri::command]
fn read_html_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|e| e.to_string())
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_html_tree, read_html_file])
        .run(tauri::generate_context!())
        .expect("error running tauri");
}
