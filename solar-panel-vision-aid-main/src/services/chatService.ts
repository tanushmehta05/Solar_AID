
import { GEMINI_API_KEY } from '@/config/api-keys';

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Send a message to the Gemini AI API and get a response
 * @param message The user's message
 * @param history Previous messages for context
 * @returns The AI's response
 */
export const sendChatMessage = async (
  message: string,
  history: Message[]
): Promise<string> => {
  try {
    // Check if API key is configured
    if (!GEMINI_API_KEY) {
      console.warn("Gemini API key not configured, using mock response");
      return getMockResponse(message);
    }

    // Transform history into the format expected by Gemini API
    const formattedHistory = history
      .filter(msg => history.indexOf(msg) !== history.length - 1) // Exclude the latest user message
      .map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

    // Prepare request to Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          ...formattedHistory,
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error('Failed to get response from Gemini API');
    }

    // Extract response text
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error in chat service:', error);
    return getMockResponse(message);
  }
};

/**
 * Get a mock response for the chat when API is not available/configured
 */
const getMockResponse = (message: string): string => {
  const responses = [
    "I'm a solar panel assistant. I can help you with information about solar panels, maintenance, and optimization. What specific questions do you have?",
    "Solar panels typically last between 25-30 years, though they can continue producing electricity at a reduced rate for much longer.",
    "The most common types of solar panels are monocrystalline, polycrystalline, and thin-film. Monocrystalline panels are the most efficient but also the most expensive.",
    "Regular cleaning is important for solar panel maintenance. Depending on your location, cleaning them 2-4 times per year is recommended.",
    "Common signs of damage include hot spots, micro-cracks, snail trails, or significant drops in power output. Our AI analysis tool can help detect these issues.",
    "The optimal angle for solar panels is typically equal to your latitude, but this can vary based on seasonal changes and your specific energy needs.",
    "Bird droppings, dust, and physical damage are the most common issues affecting solar panel performance. Our AI can detect these problems and recommend solutions.",
    "Installing a monitoring system is the best way to track your solar panel performance over time.",
  ];

  // Simple keyword matching for slightly more relevant responses
  const keywords = [
    { words: ["clean", "washing", "dirt", "dust"], index: 3 },
    { words: ["damage", "broken", "crack", "issue"], index: 4 },
    { words: ["angle", "tilt", "direction", "position"], index: 5 },
    { words: ["bird", "dropping", "physical", "problem"], index: 6 },
    { words: ["monitor", "track", "performance", "output"], index: 7 },
    { words: ["type", "kind", "difference", "better"], index: 2 },
    { words: ["long", "last", "lifetime", "year"], index: 1 },
  ];

  // Check for keywords
  for (const keyword of keywords) {
    if (keyword.words.some(word => message.toLowerCase().includes(word))) {
      return responses[keyword.index];
    }
  }

  // Default response
  return responses[0];
};
