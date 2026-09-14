import { Router } from 'express';

import { ActivityModel } from '../models/Activity.js';
import { LeaderboardModel } from '../models/Leaderboard.js';
import { TeamModel } from '../models/Team.js';
import { UserModel } from '../models/User.js';
import { WorkoutModel } from '../models/Workout.js';

const router = Router();

router.get('/api/users/', async (_request, response, next) => {
  try {
    const users = await UserModel.find().sort({ username: 1 }).lean();
    response.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/api/teams/', async (_request, response, next) => {
  try {
    const teams = await TeamModel.find().sort({ name: 1 }).lean();
    response.json(teams);
  } catch (error) {
    next(error);
  }
});

router.get('/api/activities/', async (_request, response, next) => {
  try {
    const activities = await ActivityModel.find().sort({ activityDate: -1 }).lean();
    response.json(activities);
  } catch (error) {
    next(error);
  }
});

router.get('/api/leaderboard/', async (_request, response, next) => {
  try {
    const leaderboard = await LeaderboardModel.find().sort({ rank: 1 }).lean();
    response.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

router.get('/api/workouts/', async (_request, response, next) => {
  try {
    const workouts = await WorkoutModel.find().sort({ difficulty: 1, name: 1 }).lean();
    response.json(workouts);
  } catch (error) {
    next(error);
  }
});

export default router;