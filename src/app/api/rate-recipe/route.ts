import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function ensureHouseholdId(): Promise<string | null> {
  const { data } = await supabase.from('households').select('id').limit(1);
  if (data && data.length > 0) return data[0].id;
  const { data: created } = await supabase
    .from('households')
    .insert({ name: 'Our Household' })
    .select()
    .single();
  return created?.id ?? null;
}

export async function GET(req: NextRequest) {
  const recipeId = req.nextUrl.searchParams.get('recipeId');
  if (!recipeId) return NextResponse.json({ rating: null });

  const householdId = await ensureHouseholdId();
  if (!householdId) return NextResponse.json({ rating: null });

  const { data } = await supabase
    .from('meal_ratings')
    .select('rating')
    .eq('recipe_id', recipeId)
    .eq('household_id', householdId)
    .maybeSingle();

  return NextResponse.json({ rating: data?.rating ?? null });
}

export async function POST(req: NextRequest) {
  const { recipeId, rating } = await req.json();
  if (!recipeId) return NextResponse.json({ error: 'Missing recipeId' }, { status: 400 });

  const householdId = await ensureHouseholdId();
  if (!householdId) return NextResponse.json({ error: 'No household' }, { status: 500 });

  if (rating === null) {
    await supabase
      .from('meal_ratings')
      .delete()
      .eq('recipe_id', recipeId)
      .eq('household_id', householdId);
  } else if (rating === 1 || rating === -1) {
    const { error } = await supabase
      .from('meal_ratings')
      .upsert({ recipe_id: recipeId, household_id: householdId, rating }, { onConflict: 'recipe_id,household_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
