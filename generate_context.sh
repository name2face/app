#!/bin/bash

# Script to concatenate relevant project files for context, including a directory tree overview.
# Excludes large/unnecessary directories and files.
# Automatically saves the output to 'context.txt' in the current directory.
# Run this script from the root directory of your React Native project using: ./generate_context.sh

# Define the output file name
OUTPUT_FILE="context.txt"

# Directories/files to exclude from BOTH tree and find
# Use pipe | as separator for tree's -I pattern
TREE_EXCLUDE_PATTERN='node_modules|.expo|.git|ios/Pods|ios/build|android/build|android/app/build|web-build|context.txt'
# Specific files to exclude only from find's content gathering (in addition to the above)
FIND_EXCLUDE_FILES=('package-lock.json' 'yarn.lock' '.DS_Store')

# Print status messages to stderr (so they don't end up in the output file)
echo "Gathering project context..." >&2
echo "Excluding directories/files matching pattern: ${TREE_EXCLUDE_PATTERN}" >&2
echo "Output will be saved to ${OUTPUT_FILE}" >&2
echo "==================================================" >&2
echo "" >&2

# --- Start of redirected block ---
# The stdout of all commands within the curly braces {} will be redirected to $OUTPUT_FILE
{
    # --- Add Directory Tree ---
    echo "--- START TREE ---"
    # Check if tree command exists
    if command -v tree &> /dev/null; then
        # Run tree, ignoring specified patterns. -a includes hidden files (like .gitignore)
        tree -a -I "$TREE_EXCLUDE_PATTERN"
    else
        # If tree command not found, print a placeholder and info to stderr
        echo "[Tree command not found. Install with 'brew install tree' for a directory overview.]"
        echo "[Tree command not found. Skipping directory tree. Install with 'brew install tree']" >&2
    fi
    echo "--- END TREE ---"
    echo "" # Extra newline for spacing

    # --- Concatenate File Contents ---
    echo "--- START FILE CONTENTS ---"
    echo "" # Extra newline for spacing

    # Build the -not -name exclusions for find
    FIND_EXCLUDE_ARGS=()
    for fname in "${FIND_EXCLUDE_FILES[@]}"; do
        FIND_EXCLUDE_ARGS+=(-not -name "$fname")
    done

    # Use find to locate files, excluding specified directories and file types.
    find . \
        \( \
            -path './node_modules' -o \
            -path './.expo' -o \
            -path './.git' -o \
            -path './ios/Pods' -o \
            -path './ios/build' -o \
            -path './android/build' -o \
            -path './android/app/build' -o \
            -path './web-build' -o \
            -path "./${OUTPUT_FILE}" \
        \) -prune -o \
        \( \
            -name '*.js' -o \
            -name '*.jsx' -o \
            -name '*.ts' -o \
            -name '*.tsx' -o \
            -name '*.json' -o \
            -name '*.md' \
        \) -type f \
        "${FIND_EXCLUDE_ARGS[@]}" \
        -exec sh -c '
            filepath="$1"
            # These echos go to stdout, which is being redirected to the file
            echo "--- START: ${filepath} ---"
            cat "${filepath}" && echo "" # Add newline only if cat succeeds
            echo "--- END: ${filepath} ---"
            echo "" # Extra newline for spacing
        ' sh {} \;

    echo "--- END FILE CONTENTS ---"

} > "$OUTPUT_FILE" # Redirect stdout of the entire {} block to the output file

# --- End of redirected block ---

# Check the exit status of the block (specifically the find command if tree fails)
EXIT_STATUS=$? # Note: This captures the exit status of the *last* command in the block

# Print final status messages to stderr
if [ $EXIT_STATUS -eq 0 ]; then
  echo "==================================================" >&2
  echo "Context gathering complete. Output saved to ${OUTPUT_FILE}." >&2
else
  echo "==================================================" >&2
  echo "Warning/Error occurred during context gathering (Last command exit status: $EXIT_STATUS)." >&2
  # Consider checking `tree` exit status separately if needed
fi

exit $EXIT_STATUS # Exit with the status of the last command in the block