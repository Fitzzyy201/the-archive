# AGENTS.md — Project Rules

## Core Rule: Read First, Change Later

- NEVER modify, create, delete, rename, or overwrite project files unless the user explicitly approves the change.
- For a new task, inspect and understand the relevant existing code first.
- Before making changes, explain what you found and propose the exact changes.
- Wait for explicit user approval before editing.

## Anti-AI-Slop Rules

- Do not rewrite code just because you prefer a different style.
- Do not refactor unrelated code.
- Do not introduce abstractions unless they solve a real existing problem.
- Reuse existing components, utilities, patterns, and architecture when appropriate.
- Do not create duplicate components, utilities, types, or functions.
- Do not add dependencies unless explicitly approved.
- Do not change configuration unless it is necessary for the requested task and approved.
- Do not add unnecessary comments, boilerplate, or documentation.
- Keep changes as small and focused as possible.
- Preserve existing behavior unless the requested task requires changing it.
- Do not "fix" unrelated bugs discovered during a task.
- Do not modify generated files unless explicitly requested.

## Before Editing

1. Inspect the relevant files.
2. Trace how the existing implementation works.
3. Identify existing patterns that should be reused.
4. Explain the proposed change.
5. Wait for explicit approval.

## After Editing

- Review the resulting diff.
- Verify that only requested files were changed.
- Run the most relevant existing checks when approved and practical.
- Report any remaining issues honestly.

## Safety

- Never run destructive commands without explicit approval immediately before execution.
- Never run database reset, destructive migration, force-reset, data-loss, or equivalent commands without explicit approval.
- Never expose secrets, API keys, passwords, or environment values.
- Treat existing project conventions as the default unless the user explicitly requests a change.
