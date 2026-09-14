import { Schema, Types, model } from 'mongoose';

export interface Activity {
  userId: Types.ObjectId;
  activityType: 'running' | 'walking' | 'strength';
  duration: number;
  distance: number;
  calories: number;
  date: Date;
  createdAt: Date;
}

const activitySchema = new Schema<Activity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    activityType: { type: String, enum: ['running', 'walking', 'strength'], required: true },
    duration: { type: Number, required: true, min: 0 },
    distance: { type: Number, required: true, min: 0 },
    calories: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const ActivityModel = model<Activity>('Activity', activitySchema);