// backend/src/routes/workouts.ts
import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// GET /api/workouts - Get all workouts
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('intensity_level', { ascending: true });

    if (error) throw error;

    res.json({ success: true, workouts: data });
  } catch (error: any) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/workouts/:id - Get specific workout
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ success: true, workout: data });
  } catch (error: any) {
    console.error('Error fetching workout:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/workouts/filter - Filter workouts by criteria
router.get('/filter', async (req, res) => {
  try {
    const { intensity, type, duration, symptoms } = req.query;

    let query = supabase.from('workouts').select('*');

    if (intensity) {
      query = query.eq('intensity_level', intensity);
    }

    if (type) {
      query = query.eq('workout_type', type);
    }

    if (duration) {
      query = query.lte('duration', Number(duration));
    }

    if (symptoms && typeof symptoms === 'string') {
      const symptomArray = symptoms.split(',');
      query = query.overlaps('good_for_symptoms', symptomArray);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, workouts: data });
  } catch (error: any) {
    console.error('Error filtering workouts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;