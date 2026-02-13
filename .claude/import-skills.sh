#!/bin/bash

# One-Command Skill Import
# Just list your skills in my-skills.txt and run this!

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REGISTRY_FILE="$SCRIPT_DIR/skills-registry.conf"
SKILLS_FILE="$SCRIPT_DIR/my-skills.txt"

echo "🚀 Importing skills from my-skills.txt..."
echo ""

if [ ! -f "$SKILLS_FILE" ]; then
    echo "❌ File not found: $SKILLS_FILE"
    echo "Please create .claude/my-skills.txt with your skill names"
    exit 1
fi

count=0
skipped=0

while IFS= read -r skill_name; do
    # Skip empty lines, comments, and example lines
    [[ -z "$skill_name" ]] && continue
    [[ "$skill_name" =~ ^# ]] && continue
    [[ "$skill_name" =~ ^your-skill-name ]] && continue

    # Trim whitespace
    skill_name=$(echo "$skill_name" | xargs)

    # Skip if already exists
    if grep -q "^\[$skill_name\]" "$REGISTRY_FILE" 2>/dev/null; then
        echo "⏭️  Already exists: $skill_name"
        ((skipped++))
        continue
    fi

    # Auto-generate smart triggers based on skill name
    base_triggers=$(echo "$skill_name" | sed 's/-/ /g')
    triggers="$base_triggers"
    description="$skill_name skill"

    # Add context-specific triggers
    case "$skill_name" in
        *review*|*reviewer*)
            triggers="$triggers,review,code review,audit,analyze,check code"
            description="Code review and analysis"
            ;;
        *test*|*testing*)
            triggers="$triggers,test,testing,unit test,generate tests,test coverage"
            description="Test generation and testing"
            ;;
        *doc*|*document*)
            triggers="$triggers,document,docs,documentation,readme,api docs"
            description="Documentation generation"
            ;;
        *bug*|*debug*)
            triggers="$triggers,bug,debug,error,issue,problem,fix,troubleshoot"
            description="Bug detection and debugging"
            ;;
        *optimize*|*performance*|*speed*)
            triggers="$triggers,optimize,performance,speed up,faster,improve performance"
            description="Performance optimization"
            ;;
        *security*|*secure*)
            triggers="$triggers,security,secure,vulnerability,audit,exploit"
            description="Security analysis"
            ;;
        *refactor*)
            triggers="$triggers,refactor,clean,improve,restructure,cleanup"
            description="Code refactoring"
            ;;
        *lint*|*format*)
            triggers="$triggers,lint,format,style,prettier,eslint"
            description="Code linting and formatting"
            ;;
        *api*)
            triggers="$triggers,api,endpoint,rest,graphql,request"
            description="API-related tasks"
            ;;
        *database*|*db*)
            triggers="$triggers,database,db,query,sql,migration"
            description="Database operations"
            ;;
        *deploy*|*deployment*)
            triggers="$triggers,deploy,deployment,release,publish,ship"
            description="Deployment and releases"
            ;;
        *migration*|*migrate*)
            triggers="$triggers,migrate,migration,upgrade,convert"
            description="Code migration"
            ;;
    esac

    # Add to registry
    cat >> "$REGISTRY_FILE" << EOF

[$skill_name]
triggers=$triggers
description=$description
EOF

    echo "✅ Imported: $skill_name"
    echo "   Triggers: $triggers"
    ((count++))

done < "$SKILLS_FILE"

echo ""
echo "=========================================="
echo "🎉 Import Complete!"
echo "✅ Added: $count skill(s)"
echo "⏭️  Skipped: $skipped skill(s) (already existed)"
echo "=========================================="
echo ""
echo "Your skills are now registered and will auto-trigger!"
echo ""
echo "To test: ./.claude/manage-skills.sh list"
