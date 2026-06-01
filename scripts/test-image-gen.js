const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function testImageGen() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  // Using the model identified in the search results
  const model = genAI.getGenerativeModel({ model: "nano-banana-pro-preview" });

  const prompt = "Generate a professional food photography image of 'Creamy Gochujang Beef Udon'. High resolution, cinematic lighting, shallow depth of field, top-down view.";

  try {
    console.log("Generating test image...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Log the structure to see where the image data is
    console.log("Response Candidates:", JSON.stringify(response.candidates, null, 2));
    
    // In many multimodal models, images are returned as inlineData in the parts
    const part = response.candidates[0].content.parts[0];
    if (part.inlineData) {
      const imgData = Buffer.from(part.inlineData.data, 'base64');
      fs.writeFileSync('test-recipe.png', imgData);
      console.log("✅ Test image saved to test-recipe.png");
    } else {
      console.log("❌ No image data found in response. Text output was:", response.text());
    }
  } catch (e) {
    console.error("❌ Generation failed:", e);
  }
}

testImageGen();
