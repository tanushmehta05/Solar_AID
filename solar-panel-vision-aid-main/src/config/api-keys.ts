
/**
 * API Keys configuration file
 * 
 * IMPORTANT: Replace the empty string with your actual API keys.
 * For production use, these should be stored in environment variables 
 * or a secure server-side solution.
 */

// Gemini AI API Key - Used for Chat and as a backup if ML pipeline fails
// Get your API key from: https://makersuite.google.com/app/apikey
export const GEMINI_API_KEY = ""; // Replace with your Gemini API key

// You can check if the Gemini API key is configured
export const isGeminiApiConfigured = () => {
  return GEMINI_API_KEY !== "";
};

// Visual indicator settings
// When using Gemini API as a fallback, the background will turn green
export const VISUAL_INDICATORS = {
  // Background colors
  ML_PIPELINE_BG: "bg-blue-50 dark:bg-gray-900", // Normal ML pipeline background
  GEMINI_API_BG: "bg-green-50 dark:bg-green-900", // Gemini API fallback background
  
  // Status colors
  SUCCESS_COLOR: "text-green-600 dark:text-green-400",
  ERROR_COLOR: "text-red-600 dark:text-red-400",
  WARNING_COLOR: "text-amber-600 dark:text-amber-400",
  INFO_COLOR: "text-blue-600 dark:text-blue-400"
};
