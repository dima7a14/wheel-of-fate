use serde::{Deserialize, Serialize};
use serde_json;
use std::fmt::Display;
use std::fs::File;
use std::io::{prelude::*, BufReader};
use uuid::Uuid;

use crate::color::Color;

const FILE_NAME: &'static str = "choices.json";

#[derive(Serialize, Deserialize, Debug)]
pub struct Choice {
    id: Uuid,
    name: String,
    color: Color,
}

impl Choice {
    pub fn new(name: &str, color: Color) -> Self {
        let id = Uuid::new_v4();

        Choice {
            id,
            name: name.to_string(),
            color,
        }
    }
}

pub fn save_choices(choices: Vec<Choice>) -> std::io::Result<()> {
    let serialized_choices = serde_json::to_string(&choices)?;
    let mut file = File::create(FILE_NAME)?;

    file.write_all(serialized_choices.as_bytes())?;

    Ok(())
}

pub fn load_choices() -> std::io::Result<Vec<Choice>> {
    let file = File::open(FILE_NAME)?;
    let mut buffer = BufReader::new(file);
    let mut contents = String::new();

    buffer.read_to_string(&mut contents)?;

    let json: Vec<serde_json::Value> = serde_json::from_str(&contents)?;

    let choices = json
        .iter()
        .map(|json_value| -> Result<Choice, serde_json::Error> {
            let choice = Choice::deserialize(json_value)?;
            Ok(choice)
        })
        .filter(|choice: &Result<Choice, _>| choice.is_ok())
        .map(|choice| choice.unwrap())
        .collect::<Vec<Choice>>();

    Ok(choices)
}

impl Display for Choice {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(
            f,
            "Choice(id={}, name={}, color={})",
            self.id, self.name, self.color
        )
    }
}
