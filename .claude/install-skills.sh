#!/bin/bash
# Install skills from repo to Claude Code skills directory

SKILLS_DIR="/mnt/skills/user"
REPO_SKILLS_DIR="$(dirname "$0")/skills"

# Create skills directory if it doesn't exist
mkdir -p "$SKILLS_DIR"

# Copy all skill files
if [ -d "$REPO_SKILLS_DIR" ]; then
    echo "Installing skills from .claude/skills/ to $SKILLS_DIR..."
    cp "$REPO_SKILLS_DIR"/*.md "$SKILLS_DIR/" 2>/dev/null
    echo "✓ Installed $(ls -1 "$REPO_SKILLS_DIR"/*.md 2>/dev/null | wc -l) skill files"
    ls -1 "$REPO_SKILLS_DIR"/*.md 2>/dev/null | xargs -n1 basename
else
    echo "Error: Skills directory not found at $REPO_SKILLS_DIR"
    exit 1
fi
