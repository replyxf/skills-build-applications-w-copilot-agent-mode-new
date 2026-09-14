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
        mascot: 'Lightning Shoe',
        memberUsernames: ['mona_moves', 'octo_lift'],
        weeklyGoalMinutes: 420,
      },
      {
        name: 'Core Crushers',
        mascot: 'Kettlebell',
        memberUsernames: ['hubot_hustle'],
        weeklyGoalMinutes: 300,
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
        username: 'octo_lift',
        teamName: 'Trail Blazers',
        totalMinutes: 235,
        totalCalories: 2140,
        rank: 1,
      },
      {
        username: 'mona_moves',
        teamName: 'Trail Blazers',
        totalMinutes: 210,
        totalCalories: 1985,
        rank: 2,
      },
      {
        username: 'hubot_hustle',
        teamName: 'Core Crushers',
        totalMinutes: 185,
        totalCalories: 1620,
        rank: 3,
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
