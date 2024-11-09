use core::fmt;
use serde::de::{self, Visitor};
use serde::{Deserialize, Serialize, Serializer};
use std::fmt::{Display, Formatter, Result};

// TODO: add some basic color utilities to generate nice palette

#[derive(Debug)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl Display for Color {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result {
        write!(f, "#{:02x}{:02x}{:02x}", self.r, self.g, self.b)
    }
}

impl Serialize for Color {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let hex_string = format!("#{:02x}{:02x}{:02x}", &self.r, &self.g, &self.b);
        serializer.serialize_str(&hex_string)
    }
}

impl<'de> Deserialize<'de> for Color {
    fn deserialize<D>(deserializer: D) -> std::result::Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        deserializer.deserialize_str(ColorVisitor)
    }
}

struct ColorVisitor;

impl<'de> Visitor<'de> for ColorVisitor {
    type Value = Color;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("a hex color string, e.g., #ab9d8b")
    }

    fn visit_str<E>(self, v: &str) -> std::result::Result<Self::Value, E>
    where
        E: de::Error,
    {
        if !v.starts_with('#') || v.len() != 7 {
            return Err(E::invalid_value(de::Unexpected::Str(v), &self));
        }

        let r = u8::from_str_radix(&v[1..3], 16)
            .map_err(|_| E::invalid_value(de::Unexpected::Str(v), &self))?;
        let g = u8::from_str_radix(&v[3..5], 16)
            .map_err(|_| E::invalid_value(de::Unexpected::Str(v), &self))?;
        let b = u8::from_str_radix(&v[5..7], 16)
            .map_err(|_| E::invalid_value(de::Unexpected::Str(v), &self))?;

        Ok(Color { r, g, b })
    }
}
