# Task Workflow & Execution Rules

This document defines how tasks from `plan.md` should be executed.

---

## Task Structure

Each task in `plan.md` includes:
- **Status**: ⬜ Pending | 🔄 In Progress | ✅ Done | ⏸️ Blocked
- **Description**: What the task accomplishes
- **Context**: Why this task matters
- **Dependencies**: Previous tasks that must be complete
- **Files**: Files to create or modify
- **Verification**: Steps to confirm the task works

---

## Execution Rules

### Before Each Task (Auto-Plan)
- Explain the approach and what will be done
- Wait for user approval before executing
- Ask questions **any time** ambiguity arises

### During Task Execution
- Complete tasks sequentially (0.1 → 0.2 → 0.3)
- Use specialized agents when beneficial (Explore, verify-app, etc.)
- Use MCP plugins when required (Playwright, Stripe, etc.)
- Use skills as needed (/commit, /code-review, etc.)

### After Task Completion
- **Test/verify** the task works using verification steps
- Only proceed if verification passes
- If verification fails, fix issues before moving on
- **Mark task as ✅ Done** in `plan.md`

---

## Context Management

- **Maintain context for entire phase** (don't clear between tasks in same phase)
- **At 40-50% context usage**, provide a summary:
  - Completed tasks
  - Current state
  - Remaining tasks in phase
  - Any blockers or issues
- User starts a new session with the summary

---

## Documentation Updates

When making changes:
1. Update relevant docs (PRD, architecture, ERD) if requirements change
2. Update `plan.md` to reflect task status
3. Update `changelog.md` after significant changes
4. Update `CLAUDE.md` only if project structure/rules change

---

## Files Reference

| File | Purpose |
|------|---------|
| `plan.md` | Detailed task breakdown with status |
| `task-workflow.md` | This file - execution rules |
| `changelog.md` | Version history and changes |
| `CLAUDE.md` | Project overview and conventions |
| `prd.md` | Product requirements |
| `architecture.md` | Technical architecture |
| `erd.md` | Database schema |

---

## Quick Start

To begin or resume work:
1. Read this file for workflow rules
2. Read `plan.md` to find current task
3. Execute task following the rules above
4. Mark complete and proceed to next

---

*Last Updated: January 2026*
