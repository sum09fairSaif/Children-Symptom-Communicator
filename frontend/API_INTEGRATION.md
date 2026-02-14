# 🔌 API Integration Guide

## Overview
ConnectHER frontend is now connected to the backend API for workout recommendations, favorites, and user profiles.

## 📋 Setup

### 1. Environment Variables
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### 2. Start Backend Server
Make sure your backend is running:
```bash
cd backend
npm run dev
# Backend runs on http://localhost:3000
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

## 🛠️ Available API Services

### Import the API Service
```typescript
import { apiService } from '../services/api.service';
```

### Workouts

**Get all workouts:**
```typescript
const workouts = await apiService.getWorkouts();
```

**Get specific workout:**
```typescript
const workout = await apiService.getWorkoutById('workout-id');
```

**Filter workouts:**
```typescript
const filtered = await apiService.filterWorkouts({
  intensity: 'low',
  type: 'yoga',
  trimester: '1'
});
```

### Check-In (Symptom Checker)

**Submit check-in and get AI recommendations:**
```typescript
const response = await apiService.submitCheckIn({
  user_id: user.id,
  energy_level: 2,
  symptoms: ['nausea', 'fatigue'],
  moods: ['anxious'],
  preferred_workout_type: 'yoga'
});

// Response includes:
// - check_in_id
// - recommendations (array of workouts with match scores)
// - ai_message
```

**Get check-in history:**
```typescript
const history = await apiService.getCheckInHistory(user.id);
```

### Favorites

**Get user's favorites:**
```typescript
const favorites = await apiService.getFavorites(user.id);
```

**Add to favorites:**
```typescript
const favorite = await apiService.addFavorite({
  user_id: user.id,
  workout_id: 'workout-id'
});
```

**Remove from favorites:**
```typescript
await apiService.removeFavorite(favoriteId);
```

### User Profile

**Get profile:**
```typescript
const profile = await apiService.getProfile(user.id);
```

**Create profile:**
```typescript
const profile = await apiService.createProfile({
  user_id: user.id,
  name: 'Jane Doe',
  email: 'jane@example.com',
  age: 28,
  weeks_pregnant: 12
});
```

**Update profile:**
```typescript
const updated = await apiService.updateProfile(user.id, {
  weeks_pregnant: 13,
  fitness_level: 'moderate'
});
```

## 📦 Type Definitions

All types are defined in `src/types/api.ts`:

- `Workout`
- `CheckInRequest`
- `CheckInResponse`
- `WorkoutRecommendation`
- `CheckInHistory`
- `Favorite`
- `UserProfile`

## 🎯 Integration Examples

### Example 1: Symptom Checker Integration

```typescript
import { apiService } from '../services/api.service';
import { useAuth } from '../context/AuthContext';

function SymptomChecker() {
  const { user } = useAuth();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

  const handleSubmit = async () => {
    try {
      const response = await apiService.submitCheckIn({
        user_id: user.email, // or user.id
        energy_level: 3,
        symptoms: selectedSymptoms,
        moods: selectedMoods
      });

      // Navigate to recommendations page with response.recommendations
      console.log('AI Message:', response.ai_message);
      console.log('Workouts:', response.recommendations);
    } catch (error) {
      console.error('Failed to submit check-in:', error);
    }
  };
}
```

### Example 2: Dashboard Favorites

```typescript
import { apiService } from '../services/api.service';
import { useEffect, useState } from 'react';

function Dashboard() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const data = await apiService.getFavorites(user.email);
        setFavorites(data);
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    };

    if (user) {
      loadFavorites();
    }
  }, [user]);

  return (
    <div>
      {favorites.map(fav => (
        <div key={fav.id}>
          <h3>{fav.workout?.title}</h3>
          <button onClick={() => removeFavorite(fav.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

## 🔧 Error Handling

The API service automatically handles errors and throws meaningful error messages:

```typescript
try {
  const workouts = await apiService.getWorkouts();
} catch (error) {
  // error.message will contain the API error message
  console.error('API Error:', error.message);
  // Show error to user
}
```

## 🌐 CORS Configuration

The backend is already configured with CORS. Make sure your backend `.env` has:
```
FRONTEND_URL=http://localhost:5173
```

## 📝 Next Steps

1. ✅ API service layer created
2. ✅ Type definitions ready
3. ⏳ Integrate symptom checker with check-in API
4. ⏳ Connect dashboard favorites to API
5. ⏳ Add workout recommendations display
6. ⏳ Sync user profile with backend

## 🤝 Team Collaboration

**For Backend Team:**
- Backend should be running on `http://localhost:3000`
- All endpoints are prefixed with `/api`
- CORS is configured for `http://localhost:5173`

**For Frontend Team:**
- Use `apiService` from `src/services/api.service.ts`
- All API types are in `src/types/api.ts`
- Configure `VITE_API_URL` in `.env` file

## 🧪 Testing the Connection

Test if backend is accessible:
```bash
curl http://localhost:3000/api/workouts
```

If successful, you should see a JSON response with workouts!
