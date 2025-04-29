#!/bin/sh

CONFIG_DIR="./configs"
DEFAULT_DIR="./defaults"

# Ensure the config directory exists
mkdir -p "$CONFIG_DIR"

echo "[INFO] Checking default config files..."

# Copy missing files from default config directory
for file in "$DEFAULT_DIR"/*; do
  filename=$(basename "$file")
  target="$CONFIG_DIR/$filename"

  if [ ! -e "$target" ]; then
    echo "[COPY] $filename not found, copying..."
    cp "$file" "$target"
  else
    echo "[SKIP] $filename already exists, skipping"
  fi
done

# Start the application
exec node /app/index.js