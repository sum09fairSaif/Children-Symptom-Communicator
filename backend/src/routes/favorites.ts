// backend/src/routes/favorites.ts
import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// GET /api/favorites/:userId - Get user's favorite workouts
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        workouts:workout_id (
          id,
          title,
          youtube_url,
          youtube_id,
          duration,
          intensity_level,
          workout_type,
          description,
          good_for_symptoms
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, favorites: data });
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/favorites - Add workout to favorites
router.post('/', async (req, res) => {
  try {
    const { user_id, workout_id } = req.body;

    if (!user_id || !workout_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user_id, workout_id'
      });
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user_id)
      .eq('workout_id', workout_id)
      .single();

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Workout already in favorites'
      });
    }

    // Add to favorites
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id, workout_id })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      favorite: data,
      message: 'Workout added to favorites!'
    });
  } catch (error: any) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/favorites/:id - Remove workout from favorites
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Workout removed from favorites'
    });
  } catch (error: any) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/favorites/:userId/:workoutId - Remove by user and workout ID
router.delete('/:userId/:workoutId', async (req, res) => {
  try {
    const { userId, workoutId } = req.params;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('workout_id', workoutId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Workout removed from favorites'
    });
  } catch (error: any) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;