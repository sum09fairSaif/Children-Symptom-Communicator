// backend/src/routes/profile.ts
import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// GET /api/profile/:userId - Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If profile doesn't exist yet, return null
      if (error.code === 'PGRST116') {
        return res.json({ success: true, profile: null });
      }
      throw error;
    }

    res.json({ success: true, profile: data });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/profile - Create user profile
router.post('/', async (req, res) => {
  try {
    const { user_id, display_name, preferred_workout_types, preferred_duration } = req.body;

    if (!user_id || !display_name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user_id, display_name'
      });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id,
        display_name,
        preferred_workout_types: preferred_workout_types || [],
        preferred_duration: preferred_duration || null
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      profile: data,
      message: 'Profile created successfully!'
    });
  } catch (error: any) {
    console.error('Error creating profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/profile/:userId - Update user profile
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { display_name, preferred_workout_types, preferred_duration } = req.body;

    const updateData: any = {};

    if (display_name !== undefined) updateData.display_name = display_name;
    if (preferred_workout_types !== undefined) updateData.preferred_workout_types = preferred_workout_types;
    if (preferred_duration !== undefined) updateData.preferred_duration = preferred_duration;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      profile: data,
      message: 'Profile updated successfully!'
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;