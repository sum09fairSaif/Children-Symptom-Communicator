// backend/src/routes/checkIn.ts - WITH GEMINI API
import { Router } from 'express';
import { supabase } from '../config/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// POST /api/check-in - Submit daily check-in and get Gemini recommendations
router.post('/', async (req, res) => {
  try {
    const { user_id, energy_level, symptoms, moods, preferred_workout_type } = req.body;

    // Validate required fields
    if (!user_id || !energy_level || !symptoms || !moods) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user_id, energy_level, symptoms, moods'
      });
    }

    // Validate limits
    if (symptoms.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 symptoms allowed'
      });
    }

    if (moods.length > 3) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 3 moods allowed'
      });
    }

    // Get ALL workouts from database
    const { data: allWorkouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('*');

    if (workoutsError) throw workoutsError;

    // Build prompt for Gemini
    const prompt = `You are a certified prenatal fitness expert helping a pregnant woman in her first trimester find safe workout videos.

User's Current State:
- Energy Level: ${energy_level}/5 (1=very low, 5=very high)
- Symptoms: ${symptoms.join(', ')}
- Moods: ${moods.join(', ')}
${preferred_workout_type ? `- Preferred Workout Type: ${preferred_workout_type}` : ''}

Available Workouts (JSON):
${JSON.stringify(allWorkouts, null, 2)}

Based on the user's energy level, symptoms, and moods, recommend the TOP 3 most suitable workouts from the list above.

Consider:
1. Energy level: Low energy (1-2) → low intensity, Medium (3) → medium intensity, High (4-5) → medium/high intensity
2. Symptoms: Match workouts that specifically help with their symptoms
3. Moods: If anxious/fear → calming yoga/stretching, If energetic/productive → higher intensity
4. Preferred workout type: Prioritize if specified
5. Safety: Always prioritize first-trimester safety

Respond in this EXACT JSON format (no markdown, just valid JSON):
{
  "recommendations": [
    {
      "workout_id": "uuid-here",
      "title": "workout title",
      "reasoning": "why this workout is perfect for them (2-3 sentences)"
    },
    {
      "workout_id": "uuid-here",
      "title": "workout title",
      "reasoning": "why this workout is perfect for them (2-3 sentences)"
    },
    {
      "workout_id": "uuid-here",
      "title": "workout title",
      "reasoning": "why this workout is perfect for them (2-3 sentences)"
    }
  ],
  "overall_message": "A supportive, encouraging message for the user (2-3 sentences)"
}`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse Gemini's response
    let geminiResponse;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      geminiResponse = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      throw new Error('Invalid response from AI');
    }

    // Extract workout IDs
    const recommendedWorkoutIds = geminiResponse.recommendations.map((r: any) => r.workout_id);

    // Get full workout details
    const { data: recommendedWorkouts, error: fetchError } = await supabase
      .from('workouts')
      .select('*')
      .in('id', recommendedWorkoutIds);

    if (fetchError) throw fetchError;

    // Save check-in to database with Gemini's reasoning
    const { data: checkIn, error: checkInError } = await supabase
      .from('user_check_ins')
      .insert({
        user_id,
        energy_level,
        symptoms,
        moods,
        preferred_workout_type: preferred_workout_type || null,
        recommended_workout_ids: recommendedWorkoutIds,
        gemini_reasoning: JSON.stringify(geminiResponse)
      })
      .select()
      .single();

    if (checkInError) throw checkInError;

    // Combine Gemini reasoning with workout details
    const workoutsWithReasoning = recommendedWorkouts.map((workout: any) => {
      const geminiRec = geminiResponse.recommendations.find((r: any) => r.workout_id === workout.id);
      return {
        ...workout,
        reasoning: geminiRec?.reasoning || ''
      };
    });

    res.json({
      success: true,
      checkIn,
      recommendations: workoutsWithReasoning,
      message: geminiResponse.overall_message,
      gemini_insights: geminiResponse
    });

  } catch (error: any) {
    console.error('Error processing check-in:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to process check-in'
    });
  }
});

// GET /api/check-in/history/:userId - Get user's check-in history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 30 } = req.query;

    const { data, error } = await supabase
      .from('user_check_ins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (error) throw error;

    // Parse Gemini reasoning for each check-in
    const historyWithParsedReasoning = data.map(checkIn => ({
      ...checkIn,
      gemini_reasoning: checkIn.gemini_reasoning ? JSON.parse(checkIn.gemini_reasoning) : null
    }));

    res.json({ success: true, history: historyWithParsedReasoning });
  } catch (error: any) {
    console.error('Error fetching check-in history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;