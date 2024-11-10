// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod choice;
mod color;

use crate::choice::{load_choices, save_choices, Choice};
use std::sync::{Arc, Mutex};
use tauri::{Manager, State};

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

fn main() -> std::io::Result<()> {
    tauri::Builder::default()
        .setup(|app| {
            let choices = load_choices().unwrap_or_else(|error| {
                panic!("Failed loading choices {:?}", error);
            });

            app.manage(Mutex::new(AppState { choices }));

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_choices, add_choice])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
