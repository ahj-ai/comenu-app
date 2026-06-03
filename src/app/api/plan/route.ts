import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { feeling, ingredients, optimization } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: recipes, error: dbError } = await supabase
      .from('recipes')
      .select('id, title, description, metadata');

    if (dbError) throw dbError;

    if (!recipes || recipes.length === 0) {
      return NextResponse.json({ error: "No recipes found in the database. Please run the seed script." }, { status: 400 });
    }

    const { data: ratings } = await supabase
      .from('meal_ratings')
      .select('recipe_id, rating');

    const lovedIds = new Set((ratings || []).filter(r => r.rating === 1).map(r => r.recipe_id));
    const dislikedIds = new Set((ratings || []).filter(r => r.rating === -1).map(r => r.recipe_id));
    const lovedTitles = recipes.filter(r => lovedIds.has(r.id)).map(r => r.title);
    const dislikedTitles = recipes.filter(r => dislikedIds.has(r.id)).map(r => r.title);

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite"
    });

    const prompt = `
      You are an expert meal planner. You MUST return a valid JSON object.

      CONTEXT:
      Available Recipes (ID and Title):
      ${recipes.map(r => `- ID: ${r.id}, Title: ${r.title}`).join('\n')}

      HOUSEHOLD RATINGS (use these to guide selections):
      - Loved recipes — prioritize these: ${lovedTitles.length > 0 ? lovedTitles.join(', ') : 'None yet'}
      - Disliked recipes — avoid these: ${dislikedTitles.length > 0 ? dislikedTitles.join(', ') : 'None yet'}

      USER PREFERENCES:
      - Moods/Feelings: ${feeling}
      - Pantry: ${ingredients}
      - Optimization: ${optimization}
      
      TASK:
      1. Choose exactly 7 different recipes from the context provided above.
      2. Match the selection to the user's preferences as best as possible.
      3. Assign one to each day of the week (Monday to Sunday).
      
      OUTPUT FORMAT (Strict JSON):
      {
        "plan": [
          { "day": "Monday", "recipe_id": "EXACT_ID_FROM_CONTEXT", "recipe_title": "EXACT_TITLE_FROM_CONTEXT", "reason": "Short reason why" },
          { "day": "Tuesday", "recipe_id": "...", "recipe_title": "...", "reason": "..." },
          { "day": "Wednesday", "recipe_id": "...", "recipe_title": "...", "reason": "..." },
          { "day": "Thursday", "recipe_id": "...", "recipe_title": "...", "reason": "..." },
          { "day": "Friday", "recipe_id": "...", "recipe_title": "...", "reason": "..." },
          { "day": "Saturday", "recipe_id": "...", "recipe_title": "...", "reason": "..." },
          { "day": "Sunday", "recipe_id": "...", "recipe_title": "...", "reason": "..." }
        ],
        "summary": "One sentence summary of why this plan is great."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Find the first { and the last } to extract the JSON object
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}') + 1;
      const jsonContent = text.slice(start, end);
      
      const plan = JSON.parse(jsonContent);
      return NextResponse.json(plan);
    } catch (parseError) {
      console.error("Gemini JSON Parse Error:", text);
      return NextResponse.json({ error: "Gemini returned malformed JSON.", raw: text }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Planning error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
