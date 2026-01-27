You are updating changelog.md with recent changes made in this session.

## Instructions

1. **Review the conversation** - Identify what was added, changed, fixed, or removed
2. **Read current changelog** - Check changelog.md for existing entries to avoid duplicates
3. **Categorize changes** - Sort into Added/Changed/Fixed/Removed sections
4. **Update the [Unreleased] section** - Append new entries under the appropriate category

## Format

Use bullet points with concise descriptions:
```markdown
### Added
- User authentication with Clerk
- Post editor with Tiptap

### Changed
- Migrated from SQLite to Neon PostgreSQL

### Fixed
- Slug generation now handles special characters

### Removed
- Deprecated v1 API endpoints
```

## Rules

- **Be concise** - One line per change
- **Be specific** - What exactly changed, not vague descriptions
- **No duplicates** - Check existing entries first
- **Group related changes** - Don't list every file, summarize the feature
- **Use past tense** - "Added", "Fixed", not "Add", "Fix"
- **Only significant changes** - Skip minor refactors, typo fixes, formatting

## When to create a version

When user says "release" or "version bump":
1. Move [Unreleased] items to a new version section
2. Add date in format `## [X.Y.Z] - YYYY-MM-DD`
3. Create fresh empty [Unreleased] section

## User input (if provided)

$ARGUMENTS
