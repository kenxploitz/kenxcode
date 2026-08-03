---
name: kenxcode-recon
description: Reconnaissance and information gathering for penetration testing.
version: 1.0.0
author: KenXCode Team
platforms: [linux, macos]
metadata:
  tags: [pentest, recon, security]
  category: pentest
---

# KenXCode Recon Skill

## Overview
Automated reconnaissance workflow for target enumeration.

## Workflow

### Phase 1: Passive Recon
```bash
# DNS enumeration
dig target.com ANY
dig target.com MX
dig target.com NS
dig target.com TXT

# Subdomain enumeration
subfinder -d target.com -o subs.txt
amass enum -passive -d target.com

# Certificate transparency
curl -s "https://crt.sh/?q=%25.target.com&output=json" | jq -r '.[].name_value' | sort -u

# Wayback Machine
waybackurls target.com | sort -u

# Google dorking
site:target.com filetype:php
site:target.com inurl:admin
site:target.com intitle:"index of"
```

### Phase 2: Active Recon
```bash
# Port scan
nmap -sV -sC -oA nmap_scan target.com
nmap -p- --min-rate 10000 target.com

# Technology detection
whatweb target.com
wappalyzer target.com

# Directory brute force
ffuf -u https://target.com/FUZZ -w /usr/share/wordlists/dirb/common.txt
gobuster dir -u https://target.com -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt

# Vulnerability scan
nuclei -u target.com -t cves/ -severity critical,high
nikto -h target.com
```

### Phase 3: Analysis
```bash
# Check for common vulns
curl -sk https://target.com/vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php
curl -sk https://target.com/.env
curl -sk https://target.com/.git/config
curl -sk https://target.com/wp-login.php
curl -sk https://target.com/actuator
curl -sk https://target.com/actuator/health
```

## Output Format
```markdown
## Recon Results: target.com

### DNS Records
| Type | Value |
|------|-------|
| A | 1.2.3.4 |
| MX | mail.target.com |

### Subdomains
- www.target.com
- api.target.com
- admin.target.com

### Open Ports
| Port | Service | Version |
|------|---------|---------|
| 80 | http | nginx/1.18 |
| 443 | https | nginx/1.18 |

### Technologies
- nginx/1.18.0
- PHP 8.1
- Laravel

### Potential Vulnerabilities
- [ ] PHPUnit eval-stdin (CVE-2017-9841)
- [ ] Laravel debug mode
- [ ] .env file exposed
```
