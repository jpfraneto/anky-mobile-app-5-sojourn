#!/bin/bash

# Define the directory to search in (default to current directory if not provided)
SEARCH_DIR=${1:-.}

# Print what will be removed first
echo "The following console.log statements will be removed:"
find "$SEARCH_DIR" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -exec grep -l "console.log" {} \;

# Ask for confirmation
read -p "Do you want to proceed? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Operation cancelled"
    exit 1
fi

# For macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    find "$SEARCH_DIR" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -exec sed -i '' -e '/console\.log(/d' {} \;
# For Linux
else
    find "$SEARCH_DIR" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -exec sed -i '/console\.log(/d' {} \;
fi

echo "Console.log statements have been removed!"

