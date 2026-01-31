#!/bin/bash

echo "Building ClauseGuard..."

rm -rf dist

npm run build

if [ $? -eq 0 ]; then
  echo "Build successful!"
  echo "Load the 'dist' folder in Chrome:"
  echo "1. Navigate to chrome://extensions/"
  echo "2. Enable Developer mode"
  echo "3. Click 'Load unpacked'"
  echo "4. Select the 'dist' folder"
else
  echo "Build failed!"
  exit 1
fi
