import { Router } from 'express';
import { isValidObjectId } from 'mongoose';

import { ActivityModel } from '../models/Activity.js';
import { LeaderboardModel } from '../models/Leaderboard.js';
import { TeamModel } from '../models/Team.js';
import { UserModel } from '../models/User.js';
import { WorkoutModel } from '../models/Workout.js';

const router = Router();

router.get('/api/users', async (_request, response, next) => {
  try {
    const users = await UserModel.find().sort({ name: 1 }).lean();
    response.json(users);
  } catch (error) {
    next(error);
  }
});

router.post('/api/users', async (request, response, next) => {
  try {
    const user = await UserModel.create(request.body);
    response.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/api/users/:id', async (request, response, next) => {
  try {
    if (!isValidObjectId(request.params.id)) {
      response.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const user = await UserModel.findById(request.params.id).lean();

    if (!user) {
      response.status(404).json({ message: 'User not found' });
      return;
    }

    response.json(user);
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

router.get('/api/activities', async (_request, response, next) => {
  try {
    const activities = await ActivityModel.find().sort({ date: -1 }).lean();
    response.json(activities);
  } catch (error) {
    next(error);
  }
});

router.post('/api/activities', async (request, response, next) => {
  try {
    const activity = await ActivityModel.create(request.body);
    response.status(201).json(activity);
  } catch (error) {
    next(error);
  }
});

router.get('/api/activities/:id', async (request, response, next) => {
  try {
    if (!isValidObjectId(request.params.id)) {
      response.status(400).json({ message: 'Invalid activity ID' });
      return;
    }

    const activity = await ActivityModel.findById(request.params.id).lean();

    if (!activity) {
      response.status(404).json({ message: 'Activity not found' });
      return;
    }

    response.json(activity);
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