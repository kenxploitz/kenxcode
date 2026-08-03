#!/bin/sh
# KenXCode Update Script
# Usage: curl -fsSL https://raw.githubusercontent.com/kenxploitz/kenxcode/main/update.sh | sh

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

printf "\n${YELLOW}⚡ KENXCODE UPDATER${NC}\n\n"

INSTALL_DIR="$HOME/.kenxcode"

# Check if installed
if [ ! -d "$INSTALL_DIR" ]; then
    printf "${RED}[x] KenXCode not installed! Run installer first.${NC}\n"
    exit 1
fi

# Find source directory
SOURCE_DIR=""
if [ -d "$INSTALL_DIR/kenxcode-agent" ]; then
    SOURCE_DIR="$INSTALL_DIR/kenxcode-agent"
elif [ -d "$HOME/kenxcode" ]; then
    SOURCE_DIR="$HOME/kenxcode"
fi

if [ -z "$SOURCE_DIR" ]; then
    printf "${RED}[x] Source not found. Cloning...${NC}\n"
    git clone --depth 1 https://github.com/kenxploitz/kenxcode.git "$INSTALL_DIR/kenxcode-agent"
    SOURCE_DIR="$INSTALL_DIR/kenxcode-agent"
fi

# Get current version
CUR_VER=$(grep 'version' "$SOURCE_DIR/pyproject.toml" 2>/dev/null | head -1 | sed 's/.*"\(.*\)".*/\1/')
printf "  Current: v%s\n" "$CUR_VER"

# Pull latest
printf "  Pulling latest...\n"
cd "$SOURCE_DIR"
git pull origin main 2>&1 | tail -3

# Get new version
NEW_VER=$(grep 'version' "$SOURCE_DIR/pyproject.toml" 2>/dev/null | head -1 | sed 's/.*"\(.*\)".*/\1/')
printf "  New:     v%s\n" "$NEW_VER"

# Reinstall
printf "  Reinstalling...\n"
"$INSTALL_DIR/venv/bin/python3" -m pip install "$SOURCE_DIR" --quiet 2>&1 | tail -2

# Copy updated files
[ -f "$SOURCE_DIR/SOUL.md" ] && cp "$SOURCE_DIR/SOUL.md" "$INSTALL_DIR/SOUL.md"
[ -d "$SOURCE_DIR/skills" ] && cp -r "$SOURCE_DIR/skills/"* "$INSTALL_DIR/skills/" 2>/dev/null

printf "\n${GREEN}[✓] Update complete! v%s → v%s${NC}\n" "$CUR_VER" "$NEW_VER"
printf "\n"
