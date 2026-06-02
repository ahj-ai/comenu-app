import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: latestPlan } = await supabase
      .from('weekly_plans')
      .select('plan_data, week_start_date')
      .is('household_id', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!latestPlan) return NextResponse.json({ meal: null });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    const meal = latestPlan.plan_data?.plan?.find((item: any) => item.day === today) ?? null;

    return NextResponse.json({ meal, weekStartDate: latestPlan.week_start_date });
  } catch {
    return NextResponse.json({ meal: null });
  }
}
