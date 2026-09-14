import mongoose from 'mongoose';

import { ActivityModel } from '../models/Activity.js';
import { LeaderboardModel } from '../models/Leaderboard.js';
import { TeamModel } from '../models/Team.js';
import { UserModel } from '../models/User.js';
import { WorkoutModel } from '../models/Workout.js';

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';

/**
 * Seed the octofit_db database with test data
 */
async function seedDatabase() {
  try {
    await mongoose.connect(connectionString);

    console.log('Connected to octofit_db');
    console.log('Seed the octofit_db database with test data');

    await mongoose.connection.dropDatabase();

    const [mona, hubot, octavia] = await UserModel.insertMany([
      {
        name: 'Mona Lovewalk',
        email: 'mona.moves@example.com',
      },
      {
        name: 'Hugo Botman',
        email: 'hubot.hustle@example.com',
      },
      {
        name: 'Octavia Strong',
        email: 'octo.lift@example.com',
      },
    ]);

    await TeamModel.insertMany([
      {
        name: 'Trail Blazers',
        description: 'Outdoor cardio fans building endurance together.',
        members: [mona._id, octavia._id],
      },
      {
        name: 'Core Crushers',
        description: 'Strength and mobility sessions with steady weekly progress.',
        members: [hubot._id],
      },
    ]);

    await ActivityModel.insertMany([
      {
        userId: mona._id,
        activityType: 'running',
        duration: 48,
        distance: 6.4,
        calories: 510,
        date: new Date('2026-09-10T14:30:00Z'),
      },
      {
        userId: hubot._id,
        activityType: 'strength',
        duration: 42,
        distance: 0,
        calories: 380,
        date: new Date('2026-09-11T12:00:00Z'),
      },
      {
        userId: octavia._id,
        activityType: 'walking',
        duration: 55,
        distance: 4.8,
        calories: 260,
        date: new Date('2026-09-12T16:15:00Z'),
      },
    ]);

    await LeaderboardModel.insertMany([
      {
        userId: hubot._id,
        points: LeaderboardModel.calculatePoints({ activityType: 'strength', distance: 0 }),
        totalDistance: 0,
        totalDuration: 42,
        rank: 1,
        lastUpdated: new Date(),
      },
      {
        userId: mona._id,
        points: LeaderboardModel.calculatePoints({ activityType: 'running', distance: 6.4 }),
        totalDistance: 6.4,
        totalDuration: 48,
        rank: 2,
        lastUpdated: new Date(),
      },
      {
        userId: octavia._id,
        points: LeaderboardModel.calculatePoints({ activityType: 'walking', distance: 4.8 }),
        totalDistance: 4.8,
        totalDuration: 55,
        rank: 3,
        lastUpdated: new Date(),
      },
    ]);

    await WorkoutModel.insertMany([
      {
        name: 'Morning Mobility Reset',
        focusArea: 'Mobility',
        difficulty: 'beginner',
        durationMinutes: 20,
        suggestedForGoal: 'Improve strength and mobility',
      },
      {
        name: 'Tempo Run Builder',
        focusArea: 'Cardio',
        difficulty: 'intermediate',
        durationMinutes: 45,
        suggestedForGoal: 'Build endurance for trail running',
      },
      {
        name: 'Full-Body Power Blocks',
        focusArea: 'Strength',
        difficulty: 'advanced',
        durationMinutes: 50,
        suggestedForGoal: 'Increase weekly active minutes',
      },
    ]);

    console.log('Database seeding complete');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
