// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod choice;
mod color;

use crate::choice::{load_choices, save_choices, Choice};
use std::sync::{Arc, Mutex};
use tauri::{Manager, State};
use uuid::Uuid;

#[derive(Default)]
struct AppState {
    choices: Arc<[Choice]>,
}

#[tauri::command]
fn get_choices(state: State<'_, Mutex<AppState>>) -> Arc<[Choice]> {
    let state = state.lock().unwrap();

    state.choices.clone()
}

#[tauri::command]
fn add_choice(state: State<'_, Mutex<AppState>>, choice_name: String) -> Choice {
    let mut state = state.lock().unwrap();
    let choice = Choice::new(&choice_name, None);
    let mut choices = state.choices.to_vec();

    choices.push(choice.clone());
    let _ = save_choices(&choices);
    state.choices = Arc::from(choices);

    choice
}

#[tauri::command]
fn remove_choice(state: State<'_, Mutex<AppState>>, choice_id: String) -> Arc<[Choice]> {
    let mut state = state.lock().unwrap();
    let mut choices = state.choices.to_vec();
    choices.retain(|c| c.id != Uuid::parse_str(&choice_id).unwrap());

    let _ = save_choices(&choices);
    state.choices = Arc::from(choices);

    state.choices.clone()
}

fn main() -> std::io::Result<()> {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let choices = load_choices().unwrap_or_else(|error| {
                println!("Failed loading choices {:?}", error);
                Arc::new([])
            });

            app.manage(Mutex::new(AppState { choices }));

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            get_choices,
            add_choice,
            remove_choice
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
