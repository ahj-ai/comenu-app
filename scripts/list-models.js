const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    console.log("Using API Key:", apiKey.substring(0, 10) + "...");
    
    // Fetch directly from the REST API to see what's happening
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.log("❌ API Error:", data.error);
    } else {
      console.log("✅ Available Models:");
      data.models?.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
    }
  } catch (e) {
    console.log("❌ Request Failed:", e.message);
  }
}

listModels();
