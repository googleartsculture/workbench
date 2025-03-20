#!/bin/bash

# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# --- Default Configuration ---
DEFAULT_DIST_DIR="dist/workbench" # Default dist directory
DEFAULT_APP_YAML="src/app.yaml" # Default app.yaml path
SCRIPT_SRC_LINE_START="script-src"
SCRIPT_SRC_ELEM_LINE_START="script-src-elem"
# --- End Default Configuration ---

# --- Parse Options ---
DIST_DIR="$DEFAULT_DIST_DIR"
APP_YAML="$DEFAULT_APP_YAML"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -d|--dist-dir)
      DIST_DIR="$2"
      shift 2
      ;;
    -a|--app-yaml)
      APP_YAML="$2"
      shift 2
      ;;
    *)
      echo "Error: Unknown option: $1"
      echo "Usage: $0 [-d|--dist-dir <directory>] [-a|--app-yaml <file>]"
      exit 1
      ;;
  esac
done

# --- End Parse Options ---

# Check if the dist directory exists
if [ ! -d "$DIST_DIR" ]; then
  echo "Error: Dist directory '$DIST_DIR' does not exist."
  exit 1
fi

# Check if the app.yaml file exists
if [ ! -f "$APP_YAML" ]; then
  echo "Error: app.yaml file '$APP_YAML' does not exist."
  exit 1
fi

# 1. Find all .js files in the dist directory
JS_FILES=$(find "$DIST_DIR" -name "*.js")

# 2. Extract the file names (without paths)
JS_FILE_NAMES=$(echo "$JS_FILES" | xargs -n 1 basename)

# 3. Build the list of hashes for the CSP
CSP_HASHES=""
for file in $JS_FILE_NAMES; do
  # Calculate SHA256 hash of the file
  HASH=$(openssl dgst -sha256 "$DIST_DIR/$file" | awk '{print $2}')
  # Add the hash to the CSP_HASHES string, formatted for CSP
  CSP_HASHES="$CSP_HASHES 'sha256-$HASH'"
done

echo "Found JS files: $JS_FILE_NAMES"
echo "Generated CSP hashes: $CSP_HASHES"

# 4. Modify the app.yaml file (using sed)
# Add the hashes to the script-src line
sed -i '' -E "s/($SCRIPT_SRC_LINE_START[^;]*)(;)/\1 $CSP_HASHES\2/g" "$APP_YAML"

# Add the hashes to the script-src-elem line
sed -i '' -E "s/($SCRIPT_SRC_ELEM_LINE_START[^;]*)(;)/\1 $CSP_HASHES\2/g" "$APP_YAML"

echo "Modified $APP_YAML with new CSP hashes."
