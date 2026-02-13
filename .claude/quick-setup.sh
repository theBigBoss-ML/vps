#!/bin/bash

# Quick Skills Setup Wizard
# One-command solution to add all your skills quickly

REGISTRY_FILE=".claude/skills-registry.conf"
TEMP_FILE="/tmp/claude-skills-import.txt"

echo "================================================"
echo "🚀 Claude Skills Quick Setup Wizard"
echo "================================================"
echo ""

show_menu() {
    echo "Choose setup method:"
    echo ""
    echo "1) 🎯 Interactive Wizard (add skills one by one)"
    echo "2) 📋 Bulk Import (paste skill names, auto-generate triggers)"
    echo "3) 📝 Import from File (provide a text file)"
    echo "4) ⚡ Quick Presets (common skills with default triggers)"
    echo "5) 🔍 Show current skills"
    echo "6) ❌ Exit"
    echo ""
    read -p "Select option (1-6): " choice
    echo ""
}

# Option 1: Interactive wizard
interactive_wizard() {
    echo "📝 Interactive Wizard - Add Multiple Skills"
    echo "=========================================="
    echo "Press ENTER with empty name to finish"
    echo ""

    while true; do
        read -p "Skill name (or ENTER to finish): " skill_name

        if [ -z "$skill_name" ]; then
            echo ""
            echo "✅ Finished adding skills!"
            break
        fi

        # Check if skill already exists
        if grep -q "^\[$skill_name\]" "$REGISTRY_FILE" 2>/dev/null; then
            echo "⚠️  Skill '$skill_name' already exists. Skip? (y/n)"
            read -p "> " skip
            if [ "$skip" = "y" ]; then
                continue
            fi
        fi

        read -p "Trigger keywords (comma-separated): " triggers
        read -p "Description: " description

        # Add to registry
        cat >> "$REGISTRY_FILE" << EOF

[$skill_name]
triggers=$triggers
description=$description
EOF

        echo "✅ Added: $skill_name"
        echo ""
    done
}

# Option 2: Bulk import with smart trigger generation
bulk_import() {
    echo "📋 Bulk Import - Paste Your Skill Names"
    echo "========================================"
    echo "Paste your skill names (one per line)"
    echo "Type 'DONE' on a new line when finished"
    echo ""
    echo "Example:"
    echo "  code-reviewer"
    echo "  test-generator"
    echo "  bug-finder"
    echo "  DONE"
    echo ""

    > "$TEMP_FILE"

    while IFS= read -r line; do
        if [ "$line" = "DONE" ]; then
            break
        fi
        if [ -n "$line" ]; then
            echo "$line" >> "$TEMP_FILE"
        fi
    done

    if [ ! -s "$TEMP_FILE" ]; then
        echo "❌ No skills entered"
        return
    fi

    echo ""
    echo "Processing skills..."
    echo ""

    while IFS= read -r skill_name; do
        # Skip if already exists
        if grep -q "^\[$skill_name\]" "$REGISTRY_FILE" 2>/dev/null; then
            echo "⏭️  Skipped (exists): $skill_name"
            continue
        fi

        # Auto-generate triggers based on skill name
        # Convert kebab-case to words and use them as triggers
        triggers=$(echo "$skill_name" | sed 's/-/ /g')

        # Add common variations
        case "$skill_name" in
            *review*)
                triggers="$triggers,review,code review,audit,analyze"
                description="Code review and analysis"
                ;;
            *test*)
                triggers="$triggers,test,testing,unit test,generate tests"
                description="Test generation and testing utilities"
                ;;
            *doc*|*document*)
                triggers="$triggers,document,docs,documentation,readme"
                description="Documentation generation"
                ;;
            *bug*|*debug*)
                triggers="$triggers,bug,debug,error,issue,problem,fix"
                description="Bug detection and debugging"
                ;;
            *optimize*|*performance*)
                triggers="$triggers,optimize,performance,speed up,faster"
                description="Performance optimization"
                ;;
            *security*|*secure*)
                triggers="$triggers,security,secure,vulnerability,audit"
                description="Security analysis and improvements"
                ;;
            *refactor*)
                triggers="$triggers,refactor,clean,improve,restructure"
                description="Code refactoring and improvements"
                ;;
            *)
                description="$skill_name skill"
                ;;
        esac

        # Add to registry
        cat >> "$REGISTRY_FILE" << EOF

[$skill_name]
triggers=$triggers
description=$description
EOF

        echo "✅ Added: $skill_name"
        echo "   Triggers: $triggers"
    done < "$TEMP_FILE"

    rm -f "$TEMP_FILE"
    echo ""
    echo "🎉 Bulk import complete!"
}

# Option 3: Import from file
import_from_file() {
    echo "📝 Import from File"
    echo "==================="
    read -p "Enter file path (e.g., ~/my-skills.txt): " filepath

    if [ ! -f "$filepath" ]; then
        echo "❌ File not found: $filepath"
        return
    fi

    echo ""
    echo "Processing file..."
    echo ""

    while IFS= read -r skill_name; do
        # Skip empty lines and comments
        [[ -z "$skill_name" ]] && continue
        [[ "$skill_name" =~ ^# ]] && continue

        # Skip if already exists
        if grep -q "^\[$skill_name\]" "$REGISTRY_FILE" 2>/dev/null; then
            echo "⏭️  Skipped (exists): $skill_name"
            continue
        fi

        # Auto-generate triggers
        triggers=$(echo "$skill_name" | sed 's/-/ /g')
        description="$skill_name skill"

        cat >> "$REGISTRY_FILE" << EOF

[$skill_name]
triggers=$triggers
description=$description
EOF

        echo "✅ Added: $skill_name"
    done < "$filepath"

    echo ""
    echo "🎉 File import complete!"
}

# Option 4: Quick presets
quick_presets() {
    echo "⚡ Quick Presets - Common Skills"
    echo "================================="
    echo ""
    echo "Select preset to install:"
    echo ""
    echo "1) 🧪 Development Suite (code-review, test-generator, refactoring)"
    echo "2) 🐛 Debugging Suite (bug-finder, error-handler, debugger)"
    echo "3) 📚 Documentation Suite (doc-writer, api-docs, readme-generator)"
    echo "4) ⚡ Performance Suite (optimizer, profiler, speed-analyzer)"
    echo "5) 🔒 Security Suite (security-auditor, vulnerability-scanner)"
    echo "6) 📦 All Suites (install everything)"
    echo "7) 🔙 Back to main menu"
    echo ""
    read -p "Select preset (1-7): " preset_choice
    echo ""

    case $preset_choice in
        1)
            add_preset_skills "code-reviewer:review,code review,audit,analyze:Code review and analysis" \
                             "test-generator:test,testing,unit test,generate tests:Test generation" \
                             "refactoring-assistant:refactor,clean,improve,restructure:Code refactoring"
            ;;
        2)
            add_preset_skills "bug-finder:bug,debug,error,issue,problem:Bug detection" \
                             "error-handler:error,exception,catch,handle:Error handling" \
                             "debugger-assistant:debug,breakpoint,trace,inspect:Debugging assistance"
            ;;
        3)
            add_preset_skills "documentation-writer:document,docs,documentation:Documentation generation" \
                             "api-documentation:api docs,swagger,openapi,endpoints:API documentation" \
                             "readme-generator:readme,getting started,setup guide:README generation"
            ;;
        4)
            add_preset_skills "performance-optimizer:optimize,performance,speed up,faster:Performance optimization" \
                             "code-profiler:profile,benchmark,measure,analyze performance:Code profiling" \
                             "speed-analyzer:slow,latency,bottleneck,performance:Speed analysis"
            ;;
        5)
            add_preset_skills "security-auditor:security,secure,vulnerability,audit:Security auditing" \
                             "vulnerability-scanner:vulnerability,cve,exploit,security:Vulnerability scanning" \
                             "secure-coding:secure code,best practices,security:Secure coding practices"
            ;;
        6)
            quick_presets_all
            ;;
        7)
            return
            ;;
        *)
            echo "❌ Invalid choice"
            ;;
    esac
}

add_preset_skills() {
    for skill_data in "$@"; do
        IFS=':' read -r skill_name triggers description <<< "$skill_data"

        if grep -q "^\[$skill_name\]" "$REGISTRY_FILE" 2>/dev/null; then
            echo "⏭️  Skipped (exists): $skill_name"
            continue
        fi

        cat >> "$REGISTRY_FILE" << EOF

[$skill_name]
triggers=$triggers
description=$description
EOF

        echo "✅ Added: $skill_name"
    done
    echo ""
    echo "🎉 Preset installed!"
}

quick_presets_all() {
    echo "Installing all presets..."
    add_preset_skills \
        "code-reviewer:review,code review,audit,analyze:Code review and analysis" \
        "test-generator:test,testing,unit test,generate tests:Test generation" \
        "refactoring-assistant:refactor,clean,improve,restructure:Code refactoring" \
        "bug-finder:bug,debug,error,issue,problem:Bug detection" \
        "error-handler:error,exception,catch,handle:Error handling" \
        "debugger-assistant:debug,breakpoint,trace,inspect:Debugging assistance" \
        "documentation-writer:document,docs,documentation:Documentation generation" \
        "api-documentation:api docs,swagger,openapi,endpoints:API documentation" \
        "readme-generator:readme,getting started,setup guide:README generation" \
        "performance-optimizer:optimize,performance,speed up,faster:Performance optimization" \
        "code-profiler:profile,benchmark,measure,analyze performance:Code profiling" \
        "speed-analyzer:slow,latency,bottleneck,performance:Speed analysis" \
        "security-auditor:security,secure,vulnerability,audit:Security auditing" \
        "vulnerability-scanner:vulnerability,cve,exploit,security:Vulnerability scanning" \
        "secure-coding:secure code,best practices,security:Secure coding practices"
}

show_current_skills() {
    ./.claude/manage-skills.sh list
    echo ""
}

# Main loop
while true; do
    show_menu

    case $choice in
        1)
            interactive_wizard
            ;;
        2)
            bulk_import
            ;;
        3)
            import_from_file
            ;;
        4)
            quick_presets
            ;;
        5)
            show_current_skills
            ;;
        6)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please select 1-6."
            echo ""
            ;;
    esac

    echo ""
    read -p "Press ENTER to continue..."
    clear
done
