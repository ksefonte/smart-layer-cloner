// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create base_images table",
            sql: "CREATE TABLE IF NOT EXISTS base_images (  
                id TEXT PRIMARY KEY,  
                name TEXT NOT NULL,  
                aspect_ratio REAL NOT NULL,  
                height INTEGER NOT NULL,  
                width INTEGER NOT NULL,  
                thumbnail_path TEXT NOT NULL,  
                file_prefix TEXT  
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create templates table",
            sql: "CREATE TABLE IF NOT EXISTS templates (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                base_id TEXT NOT NULL,
                template_path TEXT NOT NULL,
                file_suffix TEXT,
                FOREIGN KEY (base_id) REFERENCES base_images(id) ON DELETE CASCADE
            )",
            kind: MigrationKind::Up,
        },
    ];
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:test.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
