const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function testModel() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  
  for (const m of models) {
    try {
      console.log(`Testing model: ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Say hi");
      const response = await result.response;
      console.log(`✅ ${m} works: ${response.text()}`);
      return m;
    } catch (e) {
      console.log(`❌ ${m} failed: ${e.message}`);
    }
  }
}

testModel();
