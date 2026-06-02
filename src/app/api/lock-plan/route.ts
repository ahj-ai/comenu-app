import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function categorize(ingredient: string): string {
  const s = ingredient.toLowerCase();
  if (/chicken|beef|pork|salmon|tuna|shrimp|tofu|egg|turkey|lamb|fish|steak|ground meat/.test(s)) return 'Protein';
  if (/milk|cream|butter|cheese|yogurt|parmesan|mozzarella|cheddar|ricotta/.test(s)) return 'Dairy';
  if (/onion|garlic|tomato|pepper|carrot|celery|broccoli|spinach|kale|lettuce|mushroom|zucchini|potato|ginger|lemon|lime|avocado|cucumber|corn|peas|green bean|asparagus|cilantro|parsley|basil|mint|thyme|rosemary|scallion|shallot/.test(s)) return 'Produce';
  return 'Pantry';
}

export async function POST(req: Request) {
  try {
    const { plan, summary } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Monday of current week
    const now = new Date();
    const daysToMonday = now.getDay() === 0 ? -6 : 1 - now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() + daysToMonday);
    const weekStartDate = monday.toISOString().split('T')[0];

    const { data: savedPlan, error: planError } = await supabase
      .from('weekly_plans')
      .insert({ household_id: null, week_start_date: weekStartDate, plan_data: { plan, summary } })
      .select()
      .single();

    if (planError) throw planError;

    // Aggregate + categorize ingredients for the grocery list
    const recipeIds = plan.map((item: any) => item.recipe_id);
    const { data: recipes } = await supabase
      .from('recipes')
      .select('ingredients')
      .in('id', recipeIds);

    if (recipes) {
      const grouped = recipes
        .flatMap((r: any) => r.ingredients || [])
        .reduce((acc: Record<string, string[]>, item: string) => {
          const cat = categorize(item);
          (acc[cat] ??= []).push(item);
          return acc;
        }, {});

      // shopping_lists table is created by the Gemini agent — fails gracefully if not yet present
      const { error: listError } = await supabase
        .from('shopping_lists')
        .insert({ household_id: null, weekly_plan_id: savedPlan.id, items: grouped });

      if (listError) console.warn('Shopping list skipped:', listError.message);
    }

    return NextResponse.json({ success: true, planId: savedPlan.id });
  } catch (error: any) {
    console.error('Lock plan error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
