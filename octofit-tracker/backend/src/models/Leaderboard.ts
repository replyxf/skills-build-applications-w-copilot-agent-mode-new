import { Schema, model } from 'mongoose';

export interface LeaderboardEntry {
  username: string;
  teamName: string;
  totalMinutes: number;
  totalCalories: number;
  rank: number;
}

const leaderboardSchema = new Schema<LeaderboardEntry>(
  {
    username: { type: String, required: true },
    teamName: { type: String, required: true },
    totalMinutes: { type: Number, required: true },
    totalCalories: { type: Number, required: true },
    rank: { type: Number, required: true },
  },
  { timestamps: true },
);

export const LeaderboardModel = model<LeaderboardEntry>('Leaderboard', leaderboardSchema);