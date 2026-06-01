const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables. Please check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function seedRecipes() {
  try {
    const dataPath = path.resolve(__dirname, '../../recipes_enriched.json');
    if (!fs.existsSync(dataPath)) {
      console.error('recipes_enriched.json not found at', dataPath);
      return;
    }

    const recipes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`Found ${recipes.length} recipes to seed.`);

    // Map recipes to handle potential ID conflicts or missing fields
    const recipesToInsert = recipes.map(r => ({
      title: r.title,
      description: r.description,
      ingredients: r.ingredients,
      steps: r.steps,
      macros: r.macros,
      source_files: r.source_files,
      macros_normalized: r.macros_normalized,
      metadata: r.metadata,
      tags: r.tags
    }));

    // Use a simple insert instead of upsert if ON CONFLICT is failing
    const { data, error } = await supabase
      .from('recipes')
      .insert(recipesToInsert);

    if (error) {
      console.error('Error seeding recipes:', error);
    } else {
      console.log('Successfully seeded recipes!');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

seedRecipes();
