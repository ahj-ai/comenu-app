# Project: CoMenu Recipe Extraction

## Goal
Autonomously extract recipe data from a large collection of media files (MP4 videos, AAC audio, and PNG screenshots) and consolidate them into a structured JSON format. This data will likely power the "CoMenu" application.

## Core Mandates
- **Accuracy:** Ensure transcriptions and OCR results are high-fidelity.
- **Structure:** All output must follow a consistent JSON schema (Title, Description, Ingredients, Steps, Macros).
- **Efficiency:** Use subagents for batch processing to manage high-volume data and context limits.

## Architectural Decisions
- **Batch Processing:** Media files are grouped into batches and processed by `generalist` subagents to prevent session fatigue and hitting turn limits.
- **Model Selection:** Prioritize Gemini Pro (via subagents) for complex extraction tasks (video analysis, audio transcription, image OCR).
- **Incremental Progress:** Save results into `recipes_batch_X.json` files before final consolidation.

## Workflow
1. **Inventory:** List all media files in the workspace.
2. **Delegation:** Divide files into manageable batches (e.g., 20-40 files) and invoke subagents.
3. **Extraction:** Subagents analyze media, extract recipe details, and return structured JSON.
4. **Validation:** Verify extracted JSON for schema compliance.
5. **Consolidation:** Merge all batch JSONs into a single `recipes.json`.

## Current Status (May 31, 2026)
- Past session analysis complete.
- All media files (MP4, AAC, PNG) processed in batches.
- Audio extraction from large MP4 files completed using `avconvert`.
- All batch JSON files consolidated into a final `recipes.json`.
- **Project Complete:** 47 recipes extracted and structured.
