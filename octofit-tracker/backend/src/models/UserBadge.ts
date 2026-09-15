import { Schema, Types, model } from 'mongoose';

export interface UserBadge {
  userId: Types.ObjectId;
  badgeId: Types.ObjectId;
  earnedAt: Date;
}

const userBadgeSchema = new Schema<UserBadge>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  badgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
  earnedAt: { type: Date, required: true, default: Date.now },
});

userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export const UserBadgeModel = model<UserBadge>('UserBadge', userBadgeSchema);