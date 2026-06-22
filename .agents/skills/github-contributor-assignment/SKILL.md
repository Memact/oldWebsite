---
name: github-contributor-assignment
description: Guidelines for assigning contributors (like SSoC26 developers) to GitHub issues based on comments and creation.
---

# GitHub Contributor Assignment Skill

When managing issue assignments for SSoC26:

## Rules for Assignment:
1. **Check who created the issue**:
   - If the issue was created by a community contributor (not `@keepsloading`), assign it to the **creator** of the issue.
   - If the issue was created by `@keepsloading` (the maintainer), assign it to the **first person** who commented requesting assignment (e.g., using keywords like "assign me", "work on this", "claim", "/assign", "/claim").
2. **Limit Active Assignments**:
   - Ensure a contributor has a maximum of **2 active assigned issues** at any time to keep the program fair.

## How to Execute the Assignment:
Use the direct GitHub API PATCH endpoint to assign the user (this succeeds for any user who has commented or interacted with the repository):
```bash
gh api repos/<owner>/<repo>/issues/<issue-number> -X PATCH -F "assignees[]=<username>"
```
