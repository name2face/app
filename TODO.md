# Project Workflow & To Do List

This file outlines the iterative workflow for developing the Name2Face app, especially when collaborating with an AI assistant like Gemini.

## Development Cycle Checklist:

Follow these steps each time you work on the project:

1.  **Open Terminal:**
    *   Press `Cmd + Spacebar`, type `Terminal`, and press Enter.
    *   Navigate to the project directory: `cd /Users/<your_username>/code/Name2FaceApp` (replace `<your_username>` and path if needed).

2.  **Generate Project Context:**
    *   Run the context script: `./generate_context.sh`
    *   This will create/update the `context.txt` file in your project directory.

3.  **Get AI Assistance (Gemini):**
    *   Go to the Gemini web interface (or your preferred AI tool).
    *   Upload the `context.txt` file.
    *   Explain what you want to work on (e.g., "Let's refine section 2 of SPECIFICATION.md" or "Help me implement the Add Person screen based on the spec").

4.  **Iterate on SPECIFICATION.md & TODO.md (or Code):**
    *   Based on the AI discussion or your own planning, update the `SPECIFICATION.md` to reflect decisions made.
    *   Update this `TODO.md` file with the next specific tasks.
    *   If applicable, start writing or modifying code files (`.tsx`, etc.).
    *   **Save all your changes** in VS Code (File > Save All, or `Cmd + S` often).

5.  **Commit & Push Changes:**
    *   In the **Terminal**, run the following Git commands:
        *   `git status` (Optional: See what files have changed)
        *   `git add .` (Stage all changes for commit)
        *   `git commit -m "Your descriptive commit message"` (e.g., "Refine data model in SPEC", "Add basic list screen UI", "Update TODO list")
        *   `git push` (Upload your committed changes to GitHub)

6.  **Repeat:** Go back to Step 1 (or Step 2 if Terminal is still open) for the next work session.

---

## Current High-Priority Tasks:

1.  **Refine `SPECIFICATION.md`:** Work through the `[Decision Needed]` points in `SPECIFICATION.md` with the AI assistant (Gemini) or collaborators. Start with sections 1, 2, and 3.
2.  **(Next steps will be added here...)**