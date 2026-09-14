import { Router } from 'express';
import { isValidObjectId } from 'mongoose';

import { ActivityModel } from '../models/Activity.js';
import { LeaderboardModel } from '../models/Leaderboard.js';
import { TeamModel } from '../models/Team.js';
import { UserModel } from '../models/User.js';
import { WorkoutModel } from '../models/Workout.js';
import { getTeamLeaderboard, recalculateLeaderboardStandings } from '../services/leaderboard.js';

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
    const teams = await TeamModel.find().populate('members', 'name email').sort({ name: 1 }).lean();
    response.json(teams);
  } catch (error) {
    next(error);
  }
});

router.post('/api/teams', async (request, response, next) => {
  try {
    const team = await TeamModel.create(request.body);
    const populatedTeam = await TeamModel.findById(team._id).populate('members', 'name email').lean();
    response.status(201).json(populatedTeam);
  } catch (error) {
    next(error);
  }
});

router.get('/api/teams/:id', async (request, response, next) => {
  try {
    if (!isValidObjectId(request.params.id)) {
      response.status(400).json({ message: 'Invalid team ID' });
      return;
    }

    const team = await TeamModel.findById(request.params.id).populate('members', 'name email').lean();

    if (!team) {
      response.status(404).json({ message: 'Team not found' });
      return;
    }

    response.json(team);
  } catch (error) {
    next(error);
  }
});

router.post('/api/teams/:id/members', async (request, response, next) => {
  try {
    const { userId } = request.body as { userId?: string };

    if (!isValidObjectId(request.params.id) || !isValidObjectId(userId)) {
      response.status(400).json({ message: 'Valid team ID and userId are required' });
      return;
    }

    const user = await UserModel.findById(userId).lean();

    if (!user) {
      response.status(404).json({ message: 'User not found' });
      return;
    }

    const team = await TeamModel.findByIdAndUpdate(
      request.params.id,
      { $addToSet: { members: userId } },
      { returnDocument: 'after' },
    )
      .populate('members', 'name email')
      .lean();

    if (!team) {
      response.status(404).json({ message: 'Team not found' });
      return;
    }

    response.json(team);
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
    await recalculateLeaderboardStandings();
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

router.get('/api/leaderboard', async (_request, response, next) => {
  try {
    const leaderboard = await LeaderboardModel.find()
      .populate('userId', 'name email')
      .sort({ points: -1, rank: 1 })
      .lean();
    response.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

router.get('/api/leaderboard/teams', async (_request, response, next) => {
  try {
    const leaderboard = await getTeamLeaderboard();
    response.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

router.get('/api/leaderboard/:userId', async (request, response, next) => {
  try {
    if (!isValidObjectId(request.params.userId)) {
      response.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const entry = await LeaderboardModel.findOne({ userId: request.params.userId })
      .populate('userId', 'name email')
      .lean();

    if (!entry) {
      response.status(404).json({ message: 'Leaderboard entry not found' });
      return;
    }

    response.json(entry);
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