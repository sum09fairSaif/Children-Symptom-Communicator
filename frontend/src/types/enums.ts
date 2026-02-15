// frontend/src/types/enums.ts
// All enums matching the database schema

export type SymptomType =
  | 'back_pain'
  | 'weak_arm'
  | 'weak_legs'
  | 'sciatica_pain'
  | 'nausea'
  | 'morning_sickness'
  | 'fatigue'
  | 'headaches'
  | 'bloating'
  | 'weakness'
  | 'stomach_pain'
  | 'weak_in_general';

export type MoodType =
  | 'anxious'
  | 'fear'
  | 'happy'
  | 'moody'
  | 'frustrated'
  | 'energetic'
  | 'lazy'
  | 'productive';

export type WorkoutTypeEnum =
  | 'hiit'
  | 'strength_training'
  | 'core'
  | 'arms'
  | 'legs'
  | 'yoga'
  | 'stretching'
  | 'cardio'
  | 'pilates';

export type IntensityType = 'low' | 'medium' | 'high';

// Human-readable labels for UI
export const SYMPTOM_LABELS: Record<SymptomType, string> = {
  back_pain: 'Back pain',
  weak_arm: 'Weak arm',
  weak_legs: 'Weak legs',
  sciatica_pain: 'Sciatica pain',
  nausea: 'Nausea',
  morning_sickness: 'Morning Sickness',
  fatigue: 'Fatigue',
  headaches: 'Headaches',
  bloating: 'Bloating',
  weakness: 'Weakness',
  stomach_pain: 'Stomach pain',
  weak_in_general: 'Weak in general'
};

export const MOOD_LABELS: Record<MoodType, string> = {
  anxious: 'Anxious',
  fear: 'Fear',
  happy: 'Happy',
  moody: 'Moody',
  frustrated: 'Frustrated',
  energetic: 'Energetic',
  lazy: 'Lazy',
  productive: 'Productive'
};

export const WORKOUT_TYPE_LABELS: Record<WorkoutTypeEnum, string> = {
  hiit: 'HIIT',
  strength_training: 'Strength Training',
  core: 'Core',
  arms: 'Arms',
  legs: 'Legs',
  yoga: 'Yoga',
  stretching: 'Stretching',
  cardio: 'Cardio',
  pilates: 'Pilates'
};

// Arrays for easy iteration in forms
export const ALL_SYMPTOMS: SymptomType[] = [
  'back_pain',
  'weak_arm',
  'weak_legs',
  'sciatica_pain',
  'nausea',
  'morning_sickness',
  'fatigue',
  'headaches',
  'bloating',
  'weakness',
  'stomach_pain',
  'weak_in_general'
];

export const ALL_MOODS: MoodType[] = [
  'anxious',
  'fear',
  'happy',
  'moody',
  'frustrated',
  'energetic',
  'lazy',
  'productive'
];

export const ALL_WORKOUT_TYPES: WorkoutTypeEnum[] = [
  'hiit',
  'strength_training',
  'core',
  'arms',
  'legs',
  'yoga',
  'stretching',
  'cardio',
  'pilates'
];

// Interface for check-in form data
export interface CheckInData {
  energy_level: number; // 1-5
  symptoms: SymptomType[]; // Max 5
  moods: MoodType[]; // Max 3
  preferred_workout_type?: WorkoutTypeEnum;
}

// Interface for workout
export interface Workout {
  id: string;
  title: string;
  youtube_url: string;
  youtube_id: string;
  duration: number;
  intensity_level: IntensityType;
  good_for_symptoms: SymptomType[];
  workout_type: WorkoutTypeEnum;
  description: string;
  reasoning?: string; // From Gemini AI
}

// Interface for check-in response
export interface CheckInResponse {
  success: boolean;
  checkIn: {
    id: string;
    user_id: string;
    energy_level: number;
    symptoms: SymptomType[];
    moods: MoodType[];
    preferred_workout_type?: WorkoutTypeEnum;
    recommended_workout_ids: string[];
    gemini_reasoning: string;
    created_at: string;
  };
  recommendations: Workout[];
  message: string;
  gemini_insights: {
    recommendations: Array<{
      workout_id: string;
      title: string;
      reasoning: string;
    }>;
    overall_message: string;
  };
}