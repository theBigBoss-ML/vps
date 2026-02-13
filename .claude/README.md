# Claude Code Configuration

This directory contains Claude Code configuration for automatic skill triggering and session management.

## 🚀 Auto-Triggering System

This setup ensures that skills are automatically invoked when needed, both when you start new sessions and during conversations.

## 📁 Directory Structure

```
.claude/
├── settings.json              # Main configuration file
├── skills-registry.conf       # ⭐ Skills registry (maps triggers to skills)
├── manage-skills.sh           # 🛠️ Skills management helper script
├── hooks/                     # Executable hooks
│   ├── SessionStart          # Runs when session starts
│   └── UserPromptSubmit      # Runs before each prompt (reads registry)
├── skills/                   # Custom skills
│   └── session-start-hook/   # Project initialization skill
│       └── SKILL.md          # Skill instructions
└── README.md                 # This file
```

## 🎯 How It Works

### 1. SessionStart Hook
**When it runs:** Every time you start a new Claude Code session

**What it does:**
- Automatically invokes the `session-start-hook` skill
- Ensures your project environment is ready
- Checks dependencies, build config, and project health

**Result:** You don't need to manually set up anything when starting a new session!

### 2. UserPromptSubmit Hook (Intelligent Multi-Skill System)
**When it runs:** Before each message you send to Claude

**What it does:**
- Reads the `skills-registry.conf` file
- Detects trigger keywords for ALL registered skills
- Automatically invokes ANY matching skills
- Supports multiple skills triggering from one prompt

**How it works:**
1. You send a message
2. Hook scans `skills-registry.conf` for all skills and their triggers
3. Matches trigger keywords against your message
4. Invokes all relevant skills automatically

**Example:**
```
You: "Help me setup the project"
→ Hook reads skills-registry.conf
→ Detects "setup" + "project" matches session-start-hook
→ Auto-invokes session-start-hook skill
→ Claude sets up your environment automatically
```

**Multiple skills example:**
```
You: "Review this code and generate tests"
→ Hook detects "review" → triggers code-review skill
→ Hook detects "generate tests" → triggers test-generator skill
→ Both skills are invoked automatically
```

### 3. session-start-hook Skill
**What it does:**
- ✅ Checks git repository status
- ✅ Verifies dependencies are installed
- ✅ Runs TypeScript checks
- ✅ Validates linting configuration
- ✅ Reports project health status

## 🔧 Configuration

All configuration is in `settings.json`:

```json
{
  "hooks": {
    "SessionStart": { "enabled": true },
    "UserPromptSubmit": { "enabled": true }
  },
  "skills": {
    "session-start-hook": {
      "enabled": true,
      "autoInvoke": true
    }
  }
}
```

## 📝 Managing Multiple Skills (⭐ NEW!)

### Skills Registry System

The `skills-registry.conf` file is the central registry for ALL your skills. The `UserPromptSubmit` hook reads this file to determine which skills to auto-trigger.

**Key Features:**
- ✅ Supports **unlimited skills**
- ✅ Auto-triggers based on keywords
- ✅ Can trigger **multiple skills** from one prompt
- ✅ Easy to add your uploaded Claude skills
- ✅ No code changes needed - just edit the config file

### Adding Your Uploaded Skills

If you have skills uploaded to Claude.ai, you can add them to auto-trigger:

#### Method 1: Using the Management Script (Recommended)

```bash
# Add a new skill interactively
./.claude/manage-skills.sh add code-reviewer

# When prompted, enter:
# Triggers: review,code review,check code,analyze
# Description: Automated code review

# List all registered skills
./.claude/manage-skills.sh list

# Test what skills would trigger
./.claude/manage-skills.sh test "review this code"

# Show details of a specific skill
./.claude/manage-skills.sh show code-reviewer
```

#### Method 2: Edit skills-registry.conf Directly

Open `.claude/skills-registry.conf` and add:

```ini
[code-reviewer]
triggers=review,code review,check code,analyze,audit
description=Automated code review and best practices

[test-generator]
triggers=test,unit test,generate tests,testing,coverage
description=Generates unit tests for code

[documentation-writer]
triggers=document,write docs,generate docs,api docs
description=Generates documentation

[bug-finder]
triggers=bug,debug,find bug,error,issue,problem
description=Analyzes code for bugs

[performance-optimizer]
triggers=optimize,performance,speed up,faster
description=Optimizes code performance
```

### Example: Adding All Your Skills

Let's say you have these skills uploaded to Claude:
- `code-reviewer`
- `test-generator`
- `documentation-writer`
- `bug-finder`
- `performance-optimizer`

Simply add them to `skills-registry.conf`:

```bash
# Quick way to add multiple skills
./.claude/manage-skills.sh add code-reviewer
./.claude/manage-skills.sh add test-generator
./.claude/manage-skills.sh add documentation-writer
./.claude/manage-skills.sh add bug-finder
./.claude/manage-skills.sh add performance-optimizer
```

**Result:** All these skills will now auto-trigger when you use their keywords!

### Creating New Local Skills

To create a new skill from scratch:

1. Create directory: `.claude/skills/your-skill-name/`
2. Add `SKILL.md` with instructions
3. Register it in `skills-registry.conf`
4. Update `settings.json` if needed

**Example Skill Structure:**
```
.claude/skills/your-skill-name/
├── SKILL.md              # Main skill instructions
├── script.sh            # Optional: executable script
└── templates/           # Optional: file templates
    └── example.ts
```

## 🎨 Customizing Hooks

### Modify SessionStart Hook
Edit `.claude/hooks/SessionStart` to change what runs on session start:

```bash
#!/bin/bash
echo "🚀 Session starting..."
echo "SKILL:your-custom-skill"
echo "SKILL:another-skill"
exit 0
```

### Modify UserPromptSubmit Hook (Now Registry-Based!)
**You don't need to edit this hook anymore!** It automatically reads from `skills-registry.conf`.

To add new triggers:
1. Edit `.claude/skills-registry.conf`
2. Add your skill with its triggers
3. Done! No hook modification needed.

**Old way (manual):**
```bash
# Had to edit hook code every time
if echo "$USER_PROMPT" | grep -qiE "(keyword)"; then
    echo "SKILL:skill-name"
fi
```

**New way (registry-based):**
```ini
# Just add to skills-registry.conf
[skill-name]
triggers=keyword,another keyword
description=What the skill does
```

The hook automatically reads the registry and triggers all matching skills!

## 🧪 Testing Your Setup

To test if hooks are working:

1. Start a new Claude Code session
   - You should see: "🚀 Session starting - initializing project environment..."
   - The session-start-hook should run automatically

2. Send a message with trigger words:
   - "Help me setup the project"
   - Skills should be invoked automatically

3. Check hook execution:
   ```bash
   # Test SessionStart hook
   ./.claude/hooks/SessionStart

   # Test UserPromptSubmit hook
   echo "setup the project" | ./.claude/hooks/UserPromptSubmit
   ```

## 🔍 Debugging

If skills aren't auto-triggering:

1. **Check hook permissions:**
   ```bash
   ls -l .claude/hooks/
   # Should show: -rwxr-xr-x (executable)
   ```

2. **Test hooks manually:**
   ```bash
   ./.claude/hooks/SessionStart
   # Should output: SKILL:session-start-hook
   ```

3. **Check settings.json:**
   - Ensure hooks are `"enabled": true`
   - Ensure skills are `"enabled": true`

4. **View hook output:**
   - Hooks should echo `SKILL:skill-name` to trigger skills
   - Any output is visible to Claude

## 📚 Reference

- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Claude Code Hooks Documentation](https://code.claude.com/docs/en/hooks)
- [Agent Skills Guide](https://platform.claude.com/docs/en/agent-sdk/skills)

## 💡 Tips

- **Keep hooks fast:** They run on every prompt, so avoid heavy operations
- **Use skills for heavy work:** Move complex logic into skills, not hooks
- **Test incrementally:** Add one skill at a time and test it
- **Version control:** Commit your `.claude/` directory to share config with team

## 🚨 Important Notes

- Hooks run in the project directory context
- Skills have access to all Claude Code tools
- Auto-invocation works best with clear, specific trigger words
- You can always manually invoke skills with: "Use my [skill-name] skill"

---

**Last Updated:** 2025-12-17
**Project:** Striker CMS (Next.js 15 + Payload CMS 3)
