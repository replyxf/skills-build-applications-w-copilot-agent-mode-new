import { Model, Schema, Types, model } from 'mongoose';

import { Activity } from './Activity.js';

export interface LeaderboardEntry {
  userId: Types.ObjectId;
  points: number;
  totalDistance: number;
  totalDuration: number;
  rank: number;
  lastUpdated: Date;
}

interface LeaderboardModelType extends Model<LeaderboardEntry> {
  calculatePoints(activity: Pick<Activity, 'activityType' | 'distance'>): number;
}

const leaderboardSchema = new Schema<LeaderboardEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    points: { type: Number, required: true, default: 0 },
    totalDistance: { type: Number, required: true, default: 0 },
    totalDuration: { type: Number, required: true, default: 0 },
    rank: { type: Number, required: true },
    lastUpdated: { type: Date, required: true, default: Date.now },
  },
  { timestamps: false },
);

leaderboardSchema.static('calculatePoints', (activity: Pick<Activity, 'activityType' | 'distance'>) => {
  if (activity.activityType === 'running') {
    return activity.distance;
  }

  if (activity.activityType === 'walking') {
    return activity.distance * 0.5;
  }

  return 10;
});

export const LeaderboardModel = model<LeaderboardEntry, LeaderboardModelType>('Leaderboard', leaderboardSchema);