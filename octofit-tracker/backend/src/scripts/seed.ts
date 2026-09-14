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

    await Promise.all([
      UserModel.deleteMany({}),
      TeamModel.deleteMany({}),
      ActivityModel.deleteMany({}),
      LeaderboardModel.deleteMany({}),
      WorkoutModel.deleteMany({}),
    ]);

    await UserModel.insertMany([
      {
        username: 'mona_moves',
        email: 'mona.moves@example.com',
        firstName: 'Mona',
        lastName: 'Lovewalk',
        age: 31,
        fitnessGoal: 'Build endurance for trail running',
      },
      {
        username: 'hubot_hustle',
        email: 'hubot.hustle@example.com',
        firstName: 'Hugo',
        lastName: 'Botman',
        age: 27,
        fitnessGoal: 'Improve strength and mobility',
      },
      {
        username: 'octo_lift',
        email: 'octo.lift@example.com',
        firstName: 'Octavia',
        lastName: 'Strong',
        age: 35,
        fitnessGoal: 'Increase weekly active minutes',
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
        username: 'mona_moves',
        type: 'Trail Run',
        durationMinutes: 48,
        caloriesBurned: 510,
        activityDate: new Date('2026-09-10T14:30:00Z'),
      },
      {
        username: 'hubot_hustle',
        type: 'Strength Circuit',
        durationMinutes: 42,
        caloriesBurned: 380,
        activityDate: new Date('2026-09-11T12:00:00Z'),
      },
      {
        username: 'octo_lift',
        type: 'Indoor Cycling',
        durationMinutes: 55,
        caloriesBurned: 620,
        activityDate: new Date('2026-09-12T16:15:00Z'),
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
