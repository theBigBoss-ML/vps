#!/bin/bash

# Claude Code Skills Management Script
# Helper script to manage your skills registry

REGISTRY_FILE=".claude/skills-registry.conf"

show_usage() {
    cat << EOF
Claude Code Skills Management

Usage:
  ./manage-skills.sh list                    # List all registered skills
  ./manage-skills.sh add <skill-name>        # Add a new skill (interactive)
  ./manage-skills.sh test <prompt>           # Test what skills would trigger
  ./manage-skills.sh show <skill-name>       # Show details of a skill

Examples:
  ./manage-skills.sh list
  ./manage-skills.sh add code-reviewer
  ./manage-skills.sh test "help me review this code"
  ./manage-skills.sh show session-start-hook

EOF
}

list_skills() {
    echo "📋 Registered Skills:"
    echo "===================="

    local current_skill=""
    local skill_count=0

    while IFS= read -r line; do
        if [[ "$line" =~ ^\[(.+)\]$ ]]; then
            current_skill="${BASH_REMATCH[1]}"
            skill_count=$((skill_count + 1))
            echo ""
            echo "🔧 $current_skill"
        elif [[ "$line" =~ ^triggers=(.+)$ ]]; then
            echo "   Triggers: ${BASH_REMATCH[1]}"
        elif [[ "$line" =~ ^description=(.+)$ ]]; then
            echo "   Description: ${BASH_REMATCH[1]}"
        fi
    done < "$REGISTRY_FILE"

    echo ""
    echo "===================="
    echo "Total: $skill_count skill(s)"
}

add_skill() {
    local skill_name="$1"

    if [ -z "$skill_name" ]; then
        echo "Error: Please provide a skill name"
        echo "Usage: ./manage-skills.sh add <skill-name>"
        exit 1
    fi

    echo "Adding skill: $skill_name"
    echo ""
    echo "Enter trigger keywords (comma-separated):"
    read -r triggers

    echo "Enter description:"
    read -r description

    # Append to registry
    cat >> "$REGISTRY_FILE" << EOF

[$skill_name]
triggers=$triggers
description=$description
EOF

    echo ""
    echo "✅ Skill '$skill_name' added successfully!"
    echo ""
    echo "The skill will now auto-trigger when these keywords are detected:"
    echo "  $triggers"
}

test_prompt() {
    local test_prompt="$1"

    if [ -z "$test_prompt" ]; then
        echo "Error: Please provide a test prompt"
        echo "Usage: ./manage-skills.sh test \"your prompt here\""
        exit 1
    fi

    echo "Testing prompt: \"$test_prompt\""
    echo ""
    echo "Skills that would trigger:"
    echo "=========================="

    local current_skill=""
    local triggered=false

    while IFS= read -r line; do
        [[ "$line" =~ ^#.*$ ]] && continue
        [[ -z "$line" ]] && continue

        if [[ "$line" =~ ^\[(.+)\]$ ]]; then
            current_skill="${BASH_REMATCH[1]}"
            continue
        fi

        if [[ "$line" =~ ^triggers=(.+)$ ]] && [ -n "$current_skill" ]; then
            local triggers="${BASH_REMATCH[1]}"

            IFS=',' read -ra TRIGGER_ARRAY <<< "$triggers"
            for trigger in "${TRIGGER_ARRAY[@]}"; do
                trigger=$(echo "$trigger" | xargs)

                if echo "$test_prompt" | grep -qiE "\\b${trigger}\\b"; then
                    echo "✅ $current_skill (matched: '$trigger')"
                    triggered=true
                    break
                fi
            done
        fi
    done < "$REGISTRY_FILE"

    if [ "$triggered" = false ]; then
        echo "❌ No skills would be triggered"
    fi
}

show_skill() {
    local skill_name="$1"

    if [ -z "$skill_name" ]; then
        echo "Error: Please provide a skill name"
        echo "Usage: ./manage-skills.sh show <skill-name>"
        exit 1
    fi

    local found=false
    local in_skill=false

    while IFS= read -r line; do
        if [[ "$line" =~ ^\[(.+)\]$ ]]; then
            if [ "${BASH_REMATCH[1]}" = "$skill_name" ]; then
                in_skill=true
                found=true
                echo "🔧 Skill: $skill_name"
                echo "===================="
            else
                in_skill=false
            fi
            continue
        fi

        if [ "$in_skill" = true ]; then
            if [[ "$line" =~ ^triggers=(.+)$ ]]; then
                echo "Triggers: ${BASH_REMATCH[1]}"
            elif [[ "$line" =~ ^description=(.+)$ ]]; then
                echo "Description: ${BASH_REMATCH[1]}"
            fi
        fi
    done < "$REGISTRY_FILE"

    if [ "$found" = false ]; then
        echo "❌ Skill '$skill_name' not found in registry"
        exit 1
    fi
}

# Main command handler
case "$1" in
    list)
        list_skills
        ;;
    add)
        add_skill "$2"
        ;;
    test)
        test_prompt "$2"
        ;;
    show)
        show_skill "$2"
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
