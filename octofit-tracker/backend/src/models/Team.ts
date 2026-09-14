import { Schema, Types, model } from 'mongoose';

export interface Team {
  name: string;
  description: string;
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<Team>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

export const TeamModel = model<Team>('Team', teamSchema);