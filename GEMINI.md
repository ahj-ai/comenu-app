# Project: CoMenu - Smart Household Meal Planning

## Goal
Autonomously develop a full-stack web application ("CoMenu") that enables partners to co-plan household meals using a digital cookbook curated from AI-extracted recipe data.

## Core Mandates
- **Scalability:** The app should handle hundreds of recipes efficiently.
- **Shared State:** Use Supabase for real-time synchronization between household members.
- **AI Intelligence:** Leverage Gemini 3.1 Flash Lite for meal planning and Nano Banana for food photography generation.

## Architectural Decisions
- **Framework:** Next.js 15 (App Router, TypeScript) in the `comenu-app-gemini` directory.
- **Database:** Supabase (Postgres) with Row Level Security (RLS) for household privacy.
- **AI Integration:** RAG-lite planning logic that feeds local cookbook metadata directly into Gemini prompts.
- **Visuals:** AI-generated 4K food photography for all recipes via the `generate-images.js` utility.

## Current Status (June 1, 2026)
- **Phase 1 (Extraction) Complete:** 47 recipes extracted from media files.
- **Phase 2 (Web App V1) Complete:** Core Next.js application built with Cookbook, Planner, and Auth.
- **Phase 3 (Visual Polish) In Progress:** AI image generation script ready; UI updated for high-contrast/mobile readability.
- **Pending:** Add `image_url` column to Supabase; Provide GitHub remote URL for initial push.
