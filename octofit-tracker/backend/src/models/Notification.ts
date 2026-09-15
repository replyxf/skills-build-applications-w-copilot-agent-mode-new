import { Schema, Types, model } from 'mongoose';

export interface Notification {
  userId: Types.ObjectId;
  message: string;
  type: 'badge' | 'challenge' | 'team' | 'activity';
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<Notification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['badge', 'challenge', 'team', 'activity'], required: true },
  read: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, required: true, default: Date.now },
});

export const NotificationModel = model<Notification>('Notification', notificationSchema);