# CoMenu Design Documentation

## 1. Vision & Purpose
CoMenu is a shared household application designed to bridge the gap between "saving recipes on social media" and "actually cooking them." It serves as a smart digital cookbook and an AI-powered meal planner, specifically optimized for partners to co-plan their weekly dinners, focus on nutritional goals (high protein, low calorie), and simplify the "what's for dinner?" decision.

## 2. Core Architecture
The application is built as a modern, full-stack web app using the following layers:

### Tech Stack
*   **Frontend:** Next.js 15 (App Router, TypeScript)
*   **Styling:** Tailwind CSS + Lucide Icons (Responsive, mobile-first design)
*   **Backend/Database:** Supabase (Postgres)
*   **Authentication:** Supabase Auth (Shared household access)
*   **AI Engine:** Gemini 1.5 Flash (Google Generative AI)

### Data Strategy
*   **Data Ingestion:** A one-time seeding process converts enriched JSON recipe data (extracted from media files) into a relational Postgres schema.
*   **AI Context:** The "Fri-Sun" planner uses a RAG-lite (Retrieval-Augmented Generation) approach, injecting current cookbook metadata into the Gemini prompt to ensure recommendations are grounded in recipes the user actually has.

## 3. Database Schema
Defined in `supabase/migrations/`:

*   **`recipes`**: Stores the core cookbook data (Title, Ingredients, Steps, Macros, Tags).
*   **`households`**: Logical grouping for shared data between partners.
*   **`profiles`**: Extends user accounts to link them to a specific household.
*   **`weekly_plans`**: Stores the "locked-in" meal schedule for a specific week.

## 4. Key User Journeys

### The Digital Cookbook
Users browse their library of 47+ recipes. 
*   **Feature:** Real-time filtering by protein type and title.
*   **Feature:** Mobile-optimized recipe detail view with step-by-step instructions.

### The "Fri-Sun" Smart Planner
A weekend ritual to prepare for the coming week.
1.  **Input:** Users provide qualitative feedback (feeling, cravings) and quantitative goals (high protein).
2.  **Processing:** Gemini analyzes the cookbook and user input to curate 7 specific dinners.
3.  **Output:** A structured weekly plan with specific reasons for each selection.

### Shared Sync
Because the app is backed by Supabase, when one partner generates a plan or views a recipe, it is instantly reflected for the other partner.

## 5. Security & Performance
*   **RLS (Row Level Security):** Ensures recipes are public-readable but weekly plans and household data are strictly private to members of that household.
*   **Edge Optimization:** Next.js API routes handle Gemini interactions, keeping API keys secure on the server side.

## 6. Future Roadmap (V2+)
*   **Grocery List Generation:** Automatically aggregate ingredients from the weekly plan.
*   **Direct IG Import:** A funnel to paste an Instagram link and have Gemini/Vision extract the recipe directly into the app.
*   **Pantry Tracking:** Integrating "what we have" more deeply into the AI planning prompt.
