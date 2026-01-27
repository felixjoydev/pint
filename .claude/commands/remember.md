You are updating claude.md with a regression note to prevent a repeated mistake.

## Instructions

1. **Analyze the conversation** - Identify what instruction the user had to repeat or what mistake was made
2. **Extract the rule** - Distill it to ONE concise line (max 100 characters if possible)
3. **Check for duplicates** - Read claude.md and ensure this rule isn't already captured
4. **Append to Regression Notes** - Add the rule as a bullet point under "## Regression Notes"

## Format

Add entries as:
```
- [Category] Rule description
```

Categories: `[Code]`, `[Style]`, `[DB]`, `[API]`, `[UI]`, `[Test]`, `[Git]`, `[Other]`

## Examples

- `[Code] Always use named exports, not default exports`
- `[DB] Include tenant_id in all WHERE clauses`
- `[Style] Use 2-space indentation, not 4`
- `[API] Return 404 for missing resources, not 400`

## Rules

- **Be concise** - One line per rule, no explanations
- **Be specific** - Actionable, not vague
- **No duplicates** - Skip if already covered
- **Only add if necessary** - Don't add obvious things

## User input (if provided)

$ARGUMENTS
