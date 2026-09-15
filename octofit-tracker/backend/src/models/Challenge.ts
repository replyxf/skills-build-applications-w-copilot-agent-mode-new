import { Schema, model } from 'mongoose';

export interface Challenge {
  name: string;
  description: string;
  goal: number;
  duration: number;
  rewardPoints: number;
  active: boolean;
}

const challengeSchema = new Schema<Challenge>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    goal: { type: Number, required: true, min: 1 },
    duration: { type: Number, required: true, min: 1 },
    rewardPoints: { type: Number, required: true, min: 0 },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

export const ChallengeModel = model<Challenge>('Challenge', challengeSchema);