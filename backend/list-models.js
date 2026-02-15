const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyBgoopEe3t47R6_3n_lpYRmy2Aq8PTdm1w');

async function listModels() {
  try {
    console.log('Fetching available models...\n');
    
    // Try to list models using the API
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyBgoopEe3t47R6_3n_lpYRmy2Aq8PTdm1w'
    );
    
    const data = await response.json();
    
    if (data.models) {
      console.log('Available models:');
      data.models.forEach(model => {
        console.log(`- ${model.name}`);
        console.log(`  Supports: ${model.supportedGenerationMethods?.join(', ')}`);
      });
    } else {
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();