import { Schema, Types, model } from 'mongoose';

export interface UserChallenge {
  userId: Types.ObjectId;
  challengeId: Types.ObjectId;
  progress: number;
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

const userChallengeSchema = new Schema<UserChallenge>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
  progress: { type: Number, required: true, default: 0, min: 0 },
  completed: { type: Boolean, required: true, default: false },
  startedAt: { type: Date, required: true, default: Date.now },
  completedAt: { type: Date },
});

userChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

export const UserChallengeModel = model<UserChallenge>('UserChallenge', userChallengeSchema);