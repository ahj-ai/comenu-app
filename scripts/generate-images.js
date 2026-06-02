const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey || !geminiApiKey) {
  console.error('Missing environment variables. Please check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "nano-banana-pro-preview" });

const IMAGE_DIR = path.resolve(__dirname, '../public/images/recipes');

if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

async function generateImages() {
  try {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('id, title')
      .is('image_url', null);

    if (error) throw error;

    console.log(`Found ${recipes.length} recipes needing images.`);

    for (const recipe of recipes) {
      console.log(`Generating image for: ${recipe.title}...`);
      
      const prompt = `Generate a professional food photography image of '${recipe.title}'. High resolution, cinematic lighting, shallow depth of field, top-down view. 4k resolution.`;
      
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        const part = response.candidates[0].content.parts[0];
        if (part.inlineData) {
          const imgData = Buffer.from(part.inlineData.data, 'base64');
          const fileName = `${recipe.id}.jpg`;
          const filePath = path.join(IMAGE_DIR, fileName);
          
          fs.writeFileSync(filePath, imgData);
          
          const { error: updateError } = await supabase
            .from('recipes')
            .update({ image_url: `/images/recipes/${fileName}` })
            .eq('id', recipe.id);
            
          if (updateError) console.error(`Error updating DB for ${recipe.title}:`, updateError);
          else console.log(`✅ Success for ${recipe.title}`);
        } else {
          console.log(`❌ No image data for ${recipe.title}`);
        }
      } catch (genError) {
        console.error(`❌ Failed to generate for ${recipe.title}:`, genError.message);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    console.log("All done!");
  } catch (err) {
    console.error("Batch error:", err);
  }
}

generateImages();
