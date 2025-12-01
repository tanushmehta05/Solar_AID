
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables')
    }

    const { image, userId } = await req.json()

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Missing image data" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Remove data URL prefix if it exists
    const base64Image = image.includes('base64,') 
      ? image.split('base64,')[1] 
      : image

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Analyze this solar panel image and provide the following information in JSON format ONLY:\n" +
                        "1. The type of damage (one of: 'Bird-drop', 'Dusty', 'Clean', 'Electrical-damage', 'Physical-damage', 'Snow')\n" +
                        "2. Confidence score (0-100)\n" +
                        "3. Estimated energy loss percentage (0-100)\n" +
                        "4. List of maintenance recommendations\n\n" +
                        "Example response format:\n" +
                        "```json\n" +
                        "{\n" +
                        '  "damageType": "Dusty",\n' +
                        '  "confidence": 85,\n' +
                        '  "energyLossPercentage": 8.5,\n' +
                        '  "recommendations": ["Clean panel surface", "Consider regular maintenance", "Check for additional damage"]\n' +
                        "}\n" +
                        "```\n" +
                        "Do not include anything else in your response other than the JSON. No explanations."
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Image
                  }
                }
              ]
            }
          ],
          generation_config: {
            temperature: 0.1,
            top_p: 0.95,
            top_k: 40,
            max_output_tokens: 2048,
          }
        }),
      }
    )

    const geminiData = await response.json()
    
    // Extract JSON from Gemini response
    let analysisResult
    try {
      const textContent = geminiData.candidates[0].content.parts[0].text
      // Extract JSON from response (it might be wrapped in code blocks)
      const jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/) || 
                      textContent.match(/```\n([\s\S]*?)\n```/) ||
                      textContent.match(/{[\s\S]*?}/)
                      
      const jsonStr = jsonMatch 
        ? jsonMatch[1] || jsonMatch[0]
        : textContent
        
      analysisResult = JSON.parse(jsonStr.replace(/```/g, '').trim())
    } catch (error) {
      console.error('Error parsing Gemini response:', error)
      console.log('Raw Gemini response:', geminiData)
      throw new Error('Failed to parse Gemini response')
    }

    // Save analysis to database if userId is provided
    if (userId) {
      try {
        // Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        // Save to analysis_history table
        await supabase.from('analysis_history').insert({
          user_id: userId,
          damage_type: analysisResult.damageType,
          confidence: analysisResult.confidence,
          energy_loss_percentage: analysisResult.energyLossPercentage,
          suggestions: analysisResult.recommendations,
          used_model: false, // false = used Gemini API
        })
      } catch (dbError) {
        console.error('Error saving analysis to database:', dbError)
        // Continue even if database save fails
      }
    }

    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  } catch (error) {
    console.error('Error in gemini-analyze function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})
