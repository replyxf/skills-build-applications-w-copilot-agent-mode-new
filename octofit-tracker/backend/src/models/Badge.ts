import { Schema, model } from 'mongoose';

export interface Badge {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

const badgeSchema = new Schema<Badge>({
  badgeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  criteria: { type: String, required: true },
});

export const BadgeModel = model<Badge>('Badge', badgeSchema);