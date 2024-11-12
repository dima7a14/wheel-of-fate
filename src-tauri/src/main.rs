// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod choice;
mod color;

use crate::choice::Choice;
use std::sync::{Arc, Mutex};
use tauri::{Manager, State};
use uuid::Uuid;

#[derive(Default)]
struct AppState {
    path: String,
    choices: Arc<[Choice]>,
}

#[tauri::command]
fn get_current_path(state: State<'_, Mutex<AppState>>) -> String {
    let state = state.lock().unwrap();

    state.path.to_string()
}

#[tauri::command]
fn get_choices(state: State<'_, Mutex<AppState>>) -> Arc<[Choice]> {
    let state = state.lock().unwrap();

    state.choices.clone()
}

#[tauri::command]
fn close_file(state: State<'_, Mutex<AppState>>) {
    let mut state = state.lock().unwrap();
    state.path.clear();
    state.choices = Arc::new([]);
}

#[tauri::command]
fn load_choices(state: State<'_, Mutex<AppState>>, file_path: String) -> Result<String, String> {
    let mut state = state.lock().unwrap();
    if let Ok(choices) = Choice::load_choices(&file_path) {
        state.path = file_path;
        state.choices = choices.clone();

        Ok("Choices loaded.".to_string())
    } else {
        println!("No choices found.");
        Err("No choices found.".to_string())
    }
}

#[tauri::command]
fn save_choices(state: State<'_, Mutex<AppState>>, file_path: String) -> Result<String, String> {
    let mut state = state.lock().unwrap();
    state.path.clear();
    let choices: Arc<[Choice]> = Arc::new([]);
    match Choice::save_choices(&file_path, &choices) {
        Ok(_) => {
            state.path = file_path;
            state.choices = choices;

            Ok("Choices saved.".to_string())
        }
        Err(_) => Err("Failed to save choices.".to_string()),
    }
}

#[tauri::command]
fn add_choice(state: State<'_, Mutex<AppState>>, choice_name: String) -> Choice {
    let mut state = state.lock().unwrap();
    let choice = Choice::new(&choice_name, None);
    let mut choices = state.choices.to_vec();

    choices.push(choice.clone());
    state.choices = Arc::from(choices);
    let _ = Choice::save_choices(&state.path, &state.choices);

    choice
}

#[tauri::command]
fn remove_choice(state: State<'_, Mutex<AppState>>, choice_id: String) -> Arc<[Choice]> {
    let mut state = state.lock().unwrap();
    let mut choices = state.choices.to_vec();
    choices.retain(|c| c.id != Uuid::parse_str(&choice_id).unwrap());
    state.choices = Arc::from(choices);
    let _ = Choice::save_choices(&state.path, &state.choices);

    state.choices.clone()
}

fn main() -> std::io::Result<()> {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let choices = Arc::new([]);

            app.manage(Mutex::new(AppState {
                path: "".to_string(),
                choices,
            }));

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            load_choices,
            save_choices,
            get_current_path,
            get_choices,
            close_file,
            add_choice,
            remove_choice
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
