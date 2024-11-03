use std::fmt::{Display, Formatter, Result};
use serde::{Deserialize, Serialize};

// TODO: add some basic color utilities to generate nice palette
#[derive(Serialize, Deserialize, Debug)]
pub struct Color(pub u8, pub u8, pub u8);

impl Display for Color {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result {
        write!(f, "#{:02x}{:02x}{:02x}", self.0, self.1, self.2)
    }
}