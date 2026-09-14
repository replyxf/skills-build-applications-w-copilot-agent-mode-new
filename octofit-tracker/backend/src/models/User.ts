import { Schema, model } from 'mongoose';

export interface User {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  fitnessGoal: string;
}

const userSchema = new Schema<User>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    fitnessGoal: { type: String, required: true },
  },
  { timestamps: true },
);

export const UserModel = model<User>('User', userSchema);