import { Schema, model } from 'mongoose';

export interface Workout {
  name: string;
  focusArea: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  suggestedForGoal: string;
}

const workoutSchema = new Schema<Workout>(
  {
    name: { type: String, required: true },
    focusArea: { type: String, required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    durationMinutes: { type: Number, required: true },
    suggestedForGoal: { type: String, required: true },
  },
  { timestamps: true },
);

export const WorkoutModel = model<Workout>('Workout', workoutSchema);