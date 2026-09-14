import { Schema, model } from 'mongoose';

export interface User {
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export const UserModel = model<User>('User', userSchema);