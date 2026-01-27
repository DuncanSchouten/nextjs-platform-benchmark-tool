#!/bin/bash
# Trigger the Platform Benchmark GitHub workflow
# Usage: ./trigger-benchmark.sh [notes]

set -e

NOTES="${1:-Manually triggered benchmark run}"

echo "🚀 Triggering Platform Benchmark workflow..."
echo "📝 Notes: $NOTES"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub CLI."
    echo "Run: gh auth login"
    exit 1
fi

# Trigger the workflow
gh workflow run benchmark.yml \
    --field notes="$NOTES" \
    --repo "$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')"

echo "✅ Workflow triggered successfully!"
echo "📊 View workflow runs: gh run list --workflow=benchmark.yml"
echo "🔍 Watch latest run: gh run watch"
