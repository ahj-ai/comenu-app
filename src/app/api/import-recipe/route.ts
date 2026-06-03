import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { url, caption } = await req.json();

    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const hasCaption = caption && caption.trim().length > 0;

    const prompt = hasCaption
      ? `You are a recipe extraction assistant. Extract a recipe from this caption text.

CAPTION TEXT:
${caption}

Rules:
- Extract ONLY from the text above. Do not invent anything not mentioned.
- For macros, use realistic estimates based on the ingredients listed.
- If the caption doesn't contain enough info for a full recipe, do your best with what's there.

OUTPUT FORMAT (strict JSON, no markdown):
{
  "title": "...",
  "description": "one sentence describing the dish",
  "ingredients": ["quantity + ingredient", ...],
  "steps": ["Step 1...", ...],
  "macros_normalized": { "calories": number, "protein_g": number, "fat_g": number, "carbs_g": number },
  "metadata": { "primary_protein": "Chicken|Beef|Salmon|Tofu|etc", "prep_time_mins": number }
}`
      : `You are a recipe extraction assistant. The user provided this URL: ${url}

You cannot access this URL. Based solely on any creator name or context visible in the URL, make a reasonable attempt, but if you cannot identify the recipe with confidence, return exactly:
{"error": "Could not extract recipe — please paste the caption text from the post"}

If you do attempt extraction, output strict JSON only:
{
  "title": "...",
  "description": "...",
  "ingredients": ["..."],
  "steps": ["..."],
  "macros_normalized": { "calories": number, "protein_g": number, "fat_g": number, "carbs_g": number },
  "metadata": { "primary_protein": "...", "prep_time_mins": number }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}') + 1;
      const recipeData = JSON.parse(text.slice(start, end));

      if (recipeData.error) {
        return NextResponse.json({ error: recipeData.error }, { status: 400 });
      }

      // Save to Database
      const { data: newRecipe, error: dbError } = await supabaseAdmin
        .from('recipes')
        .insert({
          title: recipeData.title,
          description: recipeData.description,
          ingredients: recipeData.ingredients,
          steps: recipeData.steps,
          macros_normalized: recipeData.macros_normalized,
          metadata: {
            ...recipeData.metadata,
            source_url: url,
            imported_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return NextResponse.json({ success: true, recipe: newRecipe });

    } catch (parseError) {
      console.error("Gemini Import Parse Error:", text);
      return NextResponse.json({ error: "Gemini failed to extract recipe from this URL." }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Import recipe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
