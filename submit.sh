#!/bin/bash

# Parse command line arguments
DRY_RUN="--dry-run"
if [ "$1" = "--submit" ] || [ "$1" = "-s" ]; then
  DRY_RUN=""
fi

# Build and create zip files
echo "Building extension packages..."
bun zip

# Check if output directory exists
if [ ! -d "output" ]; then
  echo "Error: output directory not found"
  exit 1
fi

# Find the latest zip files
CHROME_ZIP=$(ls -t output/*-chrome.zip 2>/dev/null | head -1)

# Check if required files exist
if [ -z "$CHROME_ZIP" ]; then
  echo "Error: Chrome zip file not found"
  exit 1
fi


echo "Using the following files:"
echo "  Chrome:  $CHROME_ZIP"
echo ""

# Run wxt submit
if [ -z "$DRY_RUN" ]; then
  echo "Running wxt submit (REAL SUBMISSION)..."
else
  echo "Running wxt submit (dry-run)..."
fi

wxt submit $DRY_RUN \
  --chrome-zip "$CHROME_ZIP"

echo ""
if [ -z "$DRY_RUN" ]; then
  echo "Submission completed successfully!"
else
  echo "Dry-run completed successfully!"
  echo "To submit for real, run: ./submit.sh --submit"
fi
