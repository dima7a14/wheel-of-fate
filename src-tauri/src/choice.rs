use rand::{thread_rng, Rng};
use serde::{Deserialize, Serialize};
use serde_json;
use std::fmt::Display;
use std::fs::File;
use std::io::{prelude::*, BufReader};
use std::path::Path;
use std::sync::Arc;
use uuid::Uuid;

use crate::color::Color;

const FILE_NAME: &'static str = "../choices.json";

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Choice {
    pub id: Uuid,
    pub name: String,
    pub color: Color,
}

impl Choice {
    pub fn new(name: &str, color: Option<Color>) -> Self {
        let id = Uuid::new_v4();
        let color = color.unwrap_or_else(|| {
            let mut rng = thread_rng();
            Color {
                r: rng.gen_range(0..=255),
                g: rng.gen_range(0..=255),
                b: rng.gen_range(0..=255),
            }
        });

        Choice {
            id,
            name: name.to_string(),
            color,
        }
    }

    pub fn load_choices(path: &str) -> std::io::Result<Arc<[Choice]>> {
        let path = Path::new(path);
        let file = File::open(path).unwrap_or_else(|error| {
            if error.kind() == std::io::ErrorKind::NotFound {
                File::create(path).unwrap_or_else(|error| {
                    panic!("Problem creating the file {:?}", error);
                })
            } else {
                panic!("Problem opening the file {:?}", error);
            }
        });
        let mut buffer = BufReader::new(file);
        let mut contents = String::new();

        buffer.read_to_string(&mut contents)?;

        let json: Vec<serde_json::Value> = serde_json::from_str(&contents).unwrap_or_else(|error| {
            if serde_json::error::Error::is_eof(&error) {
                vec![]
            } else {
                panic!("Failed parsing file as json {:?}", error);
            }
        });

        let choices = json
            .iter()
            .map(|json_value| -> Result<Choice, serde_json::Error> {
                let choice = Choice::deserialize(json_value)?;
                Ok(choice)
            })
            .filter(|choice: &Result<Choice, _>| choice.is_ok())
            .map(|choice| choice.unwrap())
            .collect::<Arc<[Choice]>>();

        Ok(choices)
    }

    pub fn save_choices(choices: &Vec<Choice>) -> std::io::Result<()> {
        let serialized_choices = serde_json::to_string(choices)?;
        let mut file = File::create(FILE_NAME)?;

        file.write_all(serialized_choices.as_bytes())?;

        Ok(())
    }
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
