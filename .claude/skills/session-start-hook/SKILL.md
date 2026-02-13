# Session Start Hook Skill

## Description
Automatically sets up the development environment when a new Claude Code session starts. This skill ensures that the project is ready for development by checking dependencies, running tests, and verifying build configuration.

## Auto-invoke
This skill should be automatically invoked when:
- A new session starts
- User mentions: "setup", "initialize", "configure environment", "start project"
- User asks about: "project setup", "repository setup", "development environment"
- Working with a Next.js/Payload CMS project

## What This Skill Does

When invoked, this skill will:

1. **Check Project Status**
   - Verify git repository status
   - Check if dependencies are installed
   - Identify the project type (Next.js, Payload CMS, etc.)

2. **Install Dependencies (if needed)**
   - Run `npm install` if `node_modules` is missing or outdated
   - Report any dependency issues

3. **Verify Build Configuration**
   - Check Next.js configuration
   - Verify TypeScript configuration
   - Check for common build issues

4. **Run Health Checks**
   - Test that TypeScript compilation works
   - Verify linting configuration
   - Check environment variables

5. **Report Status**
   - Provide a summary of the project state
   - List any issues that need attention
   - Suggest next steps

## Project Context

This is a **Striker CMS** project:
- Built with Next.js 15.4.10
- Uses Payload CMS 3.68.5
- React 19.1.0 with React Compiler enabled
- TypeScript 5.8.3
- PostgreSQL database
- S3 storage for media

## Commands to Run

Execute these commands when the skill is invoked:

```bash
# Check git status
git status

# Check if dependencies need installation
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check TypeScript compilation
echo "🔍 Checking TypeScript..."
npx tsc --noEmit || true

# Check linting
echo "🔍 Running linter..."
npm run lint || true

# Report status
echo "✅ Project environment is ready!"
```

## Expected Output

Provide a concise summary like:
```
✅ Git repository: Clean (branch: main)
✅ Dependencies: Installed (241 packages)
✅ TypeScript: No errors
✅ Linting: Passed
✅ Build config: Valid
🚀 Ready for development!
```

## Error Handling

If issues are found:
- Report them clearly
- Suggest fixes
- Ask if user wants automatic fixes applied
- Never fail silently

## Notes

- This skill is designed to run automatically via hooks
- It should complete quickly (under 30 seconds)
- It should be non-intrusive - only report critical issues
- It should adapt to the project structure
