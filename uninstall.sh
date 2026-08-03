#!/bin/sh
# KenXCode Uninstaller — Full Clean Remove
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

printf "\n"
printf "${YELLOW}  ██╗  ██╗███████╗███╗   ██╗██╗  ██╗ ██████╗ ██████╗ ██████╗ ███████╗${NC}\n"
printf "${YELLOW}  ██║ ██╔╝██╔════╝████╗  ██║╚██╗██╔╝██╔════╝██╔═══██╗██╔══██╗██╔════╝${NC}\n"
printf "${YELLOW}  █████╔╝ █████╗  ██╔██╗ ██║ ╚███╔╝ ██║     ██║   ██║██║  ██║█████╗${NC}\n"
printf "${YELLOW}  ██╔═██╗ ██╔══╝  ██║╚██╗██║ ██╔██╗ ██║     ██║   ██║██║  ██║██╔══╝${NC}\n"
printf "${YELLOW}  ██║  ██╗███████╗██║ ╚████║██╔╝ ██╗╚██████╗╚██████╔╝██████╔╝███████╗${NC}\n"
printf "${YELLOW}  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝${NC}\n"
printf "\n"
printf "  ${RED}${BOLD}UNINSTALLER — FULL CLEAN REMOVE${NC}\n"
printf "\n"
printf "  This will remove:\n"
printf "    - ~/.kenxcode/ (all files, venv, skills, config)\n"
printf "    - ~/.local/bin/kenxcode (CLI wrapper)\n"
printf "    - PATH entries in shell rc files\n"
printf "\n"
printf "  Continue? [y/N]: "
read CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    printf "  Cancelled.\n"
    exit 0
fi

printf "\n"

# Remove KenXCode directory
if [ -d "$HOME/.kenxcode" ]; then
    printf "  [+] Removing ~/.kenxcode/...\n"
    rm -rf "$HOME/.kenxcode"
    printf "  [✓] ~/.kenxcode removed\n"
else
    printf "  [!] ~/.kenxcode/ not found\n"
fi

# Remove CLI wrapper
if [ -f "$HOME/.local/bin/kenxcode" ]; then
    printf "  [+] Removing ~/.local/bin/kenxcode...\n"
    rm -f "$HOME/.local/bin/kenxcode"
    printf "  [✓] CLI wrapper removed\n"
else
    printf "  [!] ~/.local/bin/kenxcode not found\n"
fi

# Remove PATH entries from shell rc files
printf "  [+] Cleaning shell rc files...\n"
for rc in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.bash_profile" "$HOME/.profile"; do
    if [ -f "$rc" ]; then
        # Remove KenXCode lines
        grep -v '# KenXCode' "$rc" | grep -v 'kenxcode' | grep -v 'KENXCODE' > "${rc}.tmp" 2>/dev/null
        mv "${rc}.tmp" "$rc" 2>/dev/null
        printf "  [✓] Cleaned $(basename "$rc")\n"
    fi
done

# Remove source repo (optional)
printf "\n"
printf "  Remove source repo ~/kenxcode? [y/N]: "
read REMOVE_SRC
if [ "$REMOVE_SRC" = "y" ] || [ "$REMOVE_SRC" = "Y" ]; then
    rm -rf "$HOME/kenxcode"
    printf "  [✓] Source repo removed\n"
fi

printf "\n"
printf "  ${GREEN}${BOLD}═══════════════════════════════════════════════════${NC}\n"
printf "  ${GREEN}${BOLD}  KENXCODE FULLY UNINSTALLED!${NC}\n"
printf "  ${GREEN}${BOLD}═══════════════════════════════════════════════════${NC}\n"
printf "\n"
printf "  Run 'source ~/.bashrc' or 'source ~/.zshrc' to update PATH.\n"
printf "\n"
