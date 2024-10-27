// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use random::Source;
use serde::{Deserialize, Serialize};
use serde_json;
use std::fmt::Display;
use std::fs::File;
use std::io::prelude::*;
use uuid::Uuid;

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
    ];
    let mut random_source = random::default(42);
    let mut choices: Vec<Choice> = Vec::new();

    for &name in &init_choices {
        let color = Color(
            random_source.read::<u8>(),
            random_source.read::<u8>(),
            random_source.read::<u8>(),
        );
        let choice = Choice::new(name, color);
        println!("Choice - {}", choice);

        choices.push(choice);
    }

    save_choices(choices)?;

    Ok(())

    // tauri::Builder::default()
    //     .plugin(tauri_plugin_shell::init())
    //     .invoke_handler(tauri::generate_handler![greet])
    //     .run(tauri::generate_context!())
    //     .expect("error while running tauri application");
}

fn save_choices(choices: Vec<Choice>) -> std::io::Result<()> {
    let serialized_choices = choices
        .iter()
        .map(|choice| -> String { serde_json::to_string(choice).unwrap() })
        .collect::<Vec<String>>()
        .join(",");

    let mut file = File::create("choices.json")?;
    file.write_all(format!("[{}]", serialized_choices).as_bytes())?;
    Ok(())
}

#[derive(Serialize, Deserialize)]
struct Choice {
    id: Uuid,
    name: String,
    color: Color,
}

impl Choice {
    fn new(name: &str, color: Color) -> Choice {
        let id = Uuid::new_v4();

        Choice {
            id,
            name: name.to_string(),
            color,
        }
    }
}

impl Display for Choice {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Choice(id = {}, name = {}, color = {})",
            self.id, self.name, self.color
        )
    }
}

// TODO: add some basic color utilities to generate nice palette

#[derive(Serialize, Deserialize)]
struct Color(u8, u8, u8);

impl Display for Color {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "rgb({}, {}, {})", self.0, self.1, self.2)
    }
}
