// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod choice;
mod color;

use rand::{thread_rng, Rng};
use serde::{Deserialize, Serialize};
use serde_json;
use std::fmt::Display;
use crate::choice::Choice;
use crate::color::Color;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() -> std::io::Result<()> {
    let init_choices = vec![
        "The Binding of Isaac",
        "Crypt of the Necro Dancer",
        "Curse of the Dead Gods",
        "Dead Cells",
        "Dead Estate",
        "Nuclear Throne",
        "Invisible Inc.",
        "Risk of Rain 2",
        "Enter the Gungeon",
        "Noita",
        "Ravenswatch",
        "Everspace"
    ];
    let mut choices: Vec<Choice> = Vec::new();
    let mut rng = thread_rng();

    for &name in &init_choices {
        let color = Color(
            rng.gen_range(0..=255),
            rng.gen_range(0..=255),
            rng.gen_range(0..=255),
        );
        let choice = Choice::new(name, color);
        println!("Choice - {}", choice);

        choices.push(choice);
    }

    Choice::save_choices(choices)?;
    let loaded_choices = Choice::load_choices()?;

    for loaded_choice in loaded_choices {
        println!("Loaded choice - {}", loaded_choice);
    }

    Ok(())

    // tauri::Builder::default()
    //     .plugin(tauri_plugin_shell::init())
    //     .invoke_handler(tauri::generate_handler![greet])
    //     .run(tauri::generate_context!())
    //     .expect("error while running tauri application");
}
