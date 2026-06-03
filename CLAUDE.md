@AGENTS.md

# CoMenu — Codebase Guide

## What this app is
CoMenu is a household meal planning app for two partners. Core loop: browse a recipe cookbook → run the AI planner to generate a weekly menu → lock it in → shop from the generated grocery list → cook using step-by-step cook mode → rate meals to improve future AI suggestions.

---

## Tech Stack
- **Frontend:** Next.js 15 App Router, TypeScript, Tailwind CSS, Lucide icons
- **Backend:** Supabase (Postgres + Auth + RLS)
- **AI:** Google Gemini (`@google/generative-ai`) — meal planning + recipe import
- **Hosting:** Vercel (assumed)

---

## Color System — "Modern Bistro"
Do not use indigo. The design system is:

| Role | Token |
|---|---|
| Page background | `stone-50` |
| Cards / surfaces | `white` with `stone-200` borders |
| Hero (home page) | `bg-slate-950` |
| Primary CTA buttons | `bg-orange-600` hover `bg-orange-700` |
| Selected / active states | `bg-amber-50 border-orange-500 text-orange-700` |
| Accent (tags, bullets, sparkles) | `amber-500` |
| Nav logo | `text-amber-600` |
| Nav hover | `hover:text-orange-600` |

**Exception:** The recipe detail page (`/recipes/[id]`) is a dark "theater mode" page — `bg-slate-950` background throughout. Accent colors on this page use `amber-*` (not orange) for highlights and bullet points. Buttons use `bg-orange-600`.

---

## Pages

| Route | File | Notes |
|---|---|---|
| `/` | `src/app/page.tsx` | Home — hero + Tonight's Menu + Recently Added |
| `/recipes` | `src/app/recipes/page.tsx` | Cookbook grid, 4-col, photo cards + URL import modal |
| `/recipes/[id]` | `src/app/recipes/[id]/page.tsx` | Dark detail page, Cook Mode overlay, ratings |
| `/planner` | `src/app/planner/page.tsx` | AI weekly planner — moods → Gemini → lock in |
| `/shopping-list` | `src/app/shopping-list/` | Generated grocery list from locked plan |
| `/profile` | `src/app/profile/page.tsx` | Auth / sign out |
| `/login` | `src/app/login/page.tsx` | Supabase auth |

---

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/plan` | POST | Gemini generates 7-day meal plan from mood/pantry/optimization inputs + household ratings |
| `/api/lock-plan` | POST | Saves plan to `weekly_plans`, generates categorized grocery list via Gemini, saves to `shopping_lists` |
| `/api/tonight` | GET | Returns today's meal from most recent saved plan (service role — bypasses RLS) |
| `/api/rate-recipe` | GET | Returns household's current rating for a recipe |
| `/api/rate-recipe` | POST | Upserts or deletes a thumbs up/down rating |
| `/api/import-recipe` | POST | Gemini Vision scrapes a URL/Instagram link and inserts a new recipe |
| `/api/approve-plan` | POST | Partner plan approval flow |

---

## Database Schema

| Table | Key columns | Notes |
|---|---|---|
| `recipes` | `id, title, ingredients (jsonb), steps (jsonb), macros_normalized (jsonb), metadata (jsonb), tags (jsonb), image_url` | Public read, service role write |
| `households` | `id, name` | Groups partners together |
| `profiles` | `id (→ auth.users), household_id, full_name` | One per user |
| `weekly_plans` | `id, household_id, week_start_date, plan_data (jsonb)` | `plan_data = { plan: [{day, recipe_id, recipe_title, reason}], summary }` |
| `shopping_lists` | `id, household_id, weekly_plan_id, items (jsonb)` | `items` is categorized: `{ "Produce": [...], "Protein": [...] }` |
| `meal_ratings` | `id, recipe_id, household_id, rating (1 or -1)` | Unique per recipe+household. Feeds into Gemini plan prompt |

### Auth / RLS notes
All household-scoped tables use RLS policies requiring `household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid())`. API routes that need to bypass RLS (e.g. `/api/tonight`, `/api/rate-recipe`) use `SUPABASE_SERVICE_ROLE_KEY` directly. The `lock-plan` route uses `createServerSideClient()` to try real auth first, then falls back to the first available household for the dev/demo case.

---

## Key Conventions
- Client components use `createClient()` from `@/lib/supabase` (browser client, anon key)
- API routes that need service role: `createClient()` from `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY`
- Recipe images are stored at `public/images/recipes/<uuid>.jpg` and referenced as relative paths in `image_url`
- The planner prompt injects: available recipe list + household ratings (loved/disliked) + user mood/pantry/optimization
- Ratings use optimistic updates — revert on API error

---

## Feature Status
- [x] Recipe cookbook with search + protein filter
- [x] AI weekly planner (Gemini) with mood/pantry/optimization inputs
- [x] Lock In This Week — saves to DB, generates grocery list
- [x] Tonight's Menu on home page (reads from saved plan)
- [x] Recipe images (AI-generated, stored in `public/images/recipes/`)
- [x] Cook Mode — fullscreen step-by-step with Wake Lock
- [x] We Made This ratings — thumbs up/down, feeds back into Gemini
- [x] Recipe URL/Instagram import via Gemini Vision
- [x] Shopping list page
- [ ] Household invite / partner pairing UI
- [ ] Full auth-gated household flow (currently uses first-household fallback)
- [ ] Reaction emojis on planner results
