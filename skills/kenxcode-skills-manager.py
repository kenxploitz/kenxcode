#!/usr/bin/env python3
"""
KENPWN Skill System
Auto-load exploit techniques dari learn folder
- Load teknik yang berhasil sebelumnya
- Chain exploit otomatis
- Smart suggestion berdasarkan target
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

# ============================================================
# SKILL MANAGER
# ============================================================

class SkillManager:
    """Manage exploit skills and techniques"""
    
    def __init__(self, learn_dir: str = None):
        if learn_dir is None:
            learn_dir = os.path.expanduser("~/.kenpwn/learn")
        
        self.learn_dir = Path(learn_dir)
        self.learn_dir.mkdir(parents=True, exist_ok=True)
        
        # Skill categories
        self.categories = {
            "exploit": self.learn_dir / "exploit",
            "recon": self.learn_dir / "recon",
            "web": self.learn_dir / "web",
            "network": self.learn_dir / "network",
            "privesc": self.learn_dir / "privesc",
            "persistence": self.learn_dir / "persistence",
        }
        
        # Create category dirs
        for cat_dir in self.categories.values():
            cat_dir.mkdir(parents=True, exist_ok=True)
        
        # Load skills
        self.skills = self._load_all_skills()
    
    def _load_all_skills(self) -> Dict[str, List[Dict]]:
        """Load all skills from learn directory"""
        skills = {}
        
        for category, cat_dir in self.categories.items():
            skills[category] = []
            
            for skill_file in cat_dir.glob("*.md"):
                skill = self._parse_skill(skill_file)
                if skill:
                    skills[category].append(skill)
            
            # Sort by date (newest first)
            skills[category].sort(
                key=lambda x: x.get("date", ""), 
                reverse=True
            )
        
        return skills
    
    def _parse_skill(self, filepath: Path) -> Optional[Dict]:
        """Parse skill markdown file"""
        try:
            with open(filepath) as f:
                content = f.read()
            
            skill = {
                "file": str(filepath),
                "name": filepath.stem,
                "content": content,
            }
            
            # Extract metadata
            for line in content.split("\n"):
                if line.startswith("## "):
                    skill["title"] = line[3:].strip()
                elif line.startswith("- Tech Stack:"):
                    skill["tech_stack"] = line.split(":", 1)[1].strip()
                elif line.startswith("- Entry Point:"):
                    skill["entry_point"] = line.split(":", 1)[1].strip()
                elif line.startswith("- Exploit Chain:"):
                    skill["exploit_chain"] = line.split(":", 1)[1].strip()
                elif line.startswith("- Payload Kunci:"):
                    skill["payload"] = line.split(":", 1)[1].strip()
                elif line.startswith("- WAF/Protection:"):
                    skill["waf_bypass"] = line.split(":", 1)[1].strip()
                elif line.startswith("- Persistence:"):
                    skill["persistence"] = line.split(":", 1)[1].strip()
                elif "|" in line and "DATE" in line:
                    # Extract date from title
                    date_match = re.search(r'\d{4}-\d{2}-\d{2}', line)
                    if date_match:
                        skill["date"] = date_match.group()
            
            return skill
            
        except Exception as e:
            return None
    
    def save_skill(
        self,
        category: str,
        tech_stack: str,
        entry_point: str,
        exploit_chain: str,
        payload: str,
        waf_bypass: str = "None",
        persistence: str = "None",
    ) -> str:
        """Save a new skill"""
        
        if category not in self.categories:
            category = "exploit"
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        filename = f"{category}-{timestamp}.md"
        filepath = self.categories[category] / filename
        
        # Generate content
        content = f"""## Exploit Technique | {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

- Tech Stack: {tech_stack}
- Entry Point: {entry_point}
- Exploit Chain: {exploit_chain}
- Payload Kunci: {payload}
- WAF/Protection: {waf_bypass}
- Persistence: {persistence}
"""
        
        # Save
        with open(filepath, "w") as f:
            f.write(content)
        
        # Reload skills
        self.skills = self._load_all_skills()
        
        return str(filepath)
    
    def get_relevant_skills(
        self, 
        tech_stack: str = None,
        vuln_type: str = None,
        limit: int = 5
    ) -> List[Dict]:
        """Get skills relevant to target"""
        
        relevant = []
        
        for category, skills in self.skills.items():
            for skill in skills:
                score = 0
                
                # Match tech stack
                if tech_stack and skill.get("tech_stack"):
                    if tech_stack.lower() in skill["tech_stack"].lower():
                        score += 10
                
                # Match vulnerability type
                if vuln_type:
                    content = skill.get("content", "").lower()
                    if vuln_type.lower() in content:
                        score += 5
                
                # Recent skills get higher score
                if skill.get("date"):
                    try:
                        skill_date = datetime.strptime(skill["date"], "%Y-%m-%d")
                        days_old = (datetime.now() - skill_date).days
                        if days_old < 7:
                            score += 3
                        elif days_old < 30:
                            score += 1
                    except:
                        pass
                
                if score > 0:
                    relevant.append((score, skill))
        
        # Sort by score
        relevant.sort(key=lambda x: x[0], reverse=True)
        
        return [skill for _, skill in relevant[:limit]]
    
    def get_exploit_chains(self) -> List[Dict]:
        """Get all known exploit chains"""
        
        chains = []
        
        for category, skills in self.skills.items():
            for skill in skills:
                if skill.get("exploit_chain"):
                    chains.append({
                        "chain": skill["exploit_chain"],
                        "tech_stack": skill.get("tech_stack", "Unknown"),
                        "payload": skill.get("payload", ""),
                        "file": skill["file"],
                    })
        
        return chains
    
    def generate_skill_prompt(self, target_info: str = "") -> str:
        """Generate prompt with relevant skills for current target"""
        
        prompt = "=== LOADED SKILLS FROM PREVIOUS SESSIONS ===\n\n"
        
        # Get recent skills
        all_skills = []
        for category, skills in self.skills.items():
            all_skills.extend(skills)
        
        if not all_skills:
            prompt += "No previous skills found. Starting fresh.\n"
            return prompt
        
        # Sort by date
        all_skills.sort(key=lambda x: x.get("date", ""), reverse=True)
        
        # Show top 10 recent skills
        for i, skill in enumerate(all_skills[:10], 1):
            prompt += f"### Skill {i}: {skill.get('title', skill['name'])}\n"
            if skill.get("tech_stack"):
                prompt += f"- Tech: {skill['tech_stack']}\n"
            if skill.get("exploit_chain"):
                prompt += f"- Chain: {skill['exploit_chain']}\n"
            if skill.get("payload"):
                prompt += f"- Payload: {skill['payload']}\n"
            prompt += "\n"
        
        # Get exploit chains
        chains = self.get_exploit_chains()
        if chains:
            prompt += "=== EXPLOIT CHAINS ===\n\n"
            for chain in chains[:5]:
                prompt += f"- {chain['chain']}\n"
                prompt += f"  Payload: {chain['payload']}\n\n"
        
        return prompt
    
    def get_stats(self) -> Dict:
        """Get skill statistics"""
        
        stats = {
            "total": 0,
            "by_category": {},
            "recent": [],
        }
        
        all_skills = []
        for category, skills in self.skills.items():
            stats["by_category"][category] = len(skills)
            stats["total"] += len(skills)
            all_skills.extend(skills)
        
        # Recent skills
        all_skills.sort(key=lambda x: x.get("date", ""), reverse=True)
        stats["recent"] = [
            {
                "name": s.get("title", s["name"]),
                "date": s.get("date", "Unknown"),
                "tech": s.get("tech_stack", "Unknown"),
            }
            for s in all_skills[:5]
        ]
        
        return stats


# ============================================================
# LEARNING FILE MANAGER
# ============================================================

class LearningManager:
    """Manage the learned.md file"""
    
    def __init__(self, config_dir: str = None):
        if config_dir is None:
            config_dir = os.path.expanduser("~/.kenpwn/.config")
        
        self.config_dir = Path(config_dir)
        self.config_dir.mkdir(parents=True, exist_ok=True)
        
        self.learned_file = self.config_dir / "learned.md"
    
    def read(self) -> str:
        """Read learning file"""
        if self.learned_file.exists():
            return self.learned_file.read_text()
        return ""
    
    def append(self, entry: str):
        """Append to learning file"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        line = f"\n[{timestamp}] {entry}\n"
        
        with open(self.learned_file, "a") as f:
            f.write(line)
    
    def get_recent(self, limit: int = 20) -> List[str]:
        """Get recent entries"""
        content = self.read()
        entries = [line for line in content.split("\n") if line.startswith("[")]
        return entries[-limit:]


# ============================================================
# CLI INTERFACE
# ============================================================

def main():
    """CLI interface for skill system"""
    import argparse
    
    parser = argparse.ArgumentParser(description="KENPWN Skill System")
    subparsers = parser.add_subparsers(dest="command")
    
    # List skills
    list_parser = subparsers.add_parser("list", help="List all skills")
    list_parser.add_argument("--category", help="Filter by category")
    
    # Save skill
    save_parser = subparsers.add_parser("save", help="Save new skill")
    save_parser.add_argument("--category", default="exploit", help="Category")
    save_parser.add_argument("--tech", required=True, help="Tech stack")
    save_parser.add_argument("--entry", required=True, help="Entry point")
    save_parser.add_argument("--chain", required=True, help="Exploit chain")
    save_parser.add_argument("--payload", required=True, help="Key payload")
    
    # Stats
    subparsers.add_parser("stats", help="Show statistics")
    
    # Generate prompt
    subparsers.add_parser("prompt", help="Generate skill prompt")
    
    args = parser.parse_args()
    
    manager = SkillManager()
    
    if args.command == "list":
        stats = manager.get_stats()
        print(f"\n[*] Total skills: {stats['total']}")
        print("\nBy category:")
        for cat, count in stats["by_category"].items():
            print(f"  {cat}: {count}")
        
        if stats["recent"]:
            print("\nRecent skills:")
            for skill in stats["recent"]:
                print(f"  [{skill['date']}] {skill['name']} ({skill['tech']})")
    
    elif args.command == "save":
        filepath = manager.save_skill(
            category=args.category,
            tech_stack=args.tech,
            entry_point=args.entry,
            exploit_chain=args.chain,
            payload=args.payload,
        )
        print(f"[*] Skill saved to: {filepath}")
    
    elif args.command == "stats":
        stats = manager.get_stats()
        print(json.dumps(stats, indent=2))
    
    elif args.command == "prompt":
        prompt = manager.generate_skill_prompt()
        print(prompt)
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
