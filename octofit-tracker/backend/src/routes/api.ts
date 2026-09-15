import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { isValidObjectId } from 'mongoose';

import { ActivityModel } from '../models/Activity.js';
import { ChallengeModel } from '../models/Challenge.js';
import { LeaderboardModel } from '../models/Leaderboard.js';
import { NotificationModel } from '../models/Notification.js';
import { TeamModel } from '../models/Team.js';
import { UserModel } from '../models/User.js';
import { UserChallengeModel } from '../models/UserChallenge.js';
import { WorkoutModel } from '../models/Workout.js';
import {
  awardTeamPlayerBadge,
  calculateBadgeEligibilityAfterActivities,
  getUserBadges,
  updateChallengeProgress,
} from '../services/gamification.js';
import { getTeamLeaderboard, recalculateLeaderboardStandings } from '../services/leaderboard.js';

const router = Router();

const rejectInvalidRequest: RequestHandler = (request, response, next) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    response.status(400).json({ message: 'Invalid request', errors: errors.array() });
    return;
  }

  next();
};

const objectId = (field: string) => body(field).isMongoId().withMessage(`${field} must be a valid ID`);

router.get('/api/users', async (_request, response, next) => {
  try {
    const users = await UserModel.find().sort({ name: 1 }).lean();
    response.json(users);
  } catch (error) {
    next(error);
  }
});

router.post(
  '/api/users',
  [
    body('name').trim().notEmpty().isLength({ max: 100 }).escape(),
    body('email').trim().isEmail().normalizeEmail(),
    body().custom((value) => Object.keys(value).every((key) => ['name', 'email'].includes(key))),
  ],
  rejectInvalidRequest,
  async (request: Request, response: Response, next: NextFunction) => {
  try {
    const user = await UserModel.create(request.body);
    response.status(201).json(user);
  } catch (error) {
    next(error);
  }
  },
);

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

router.post(
  '/api/teams',
  [
    body('name').trim().notEmpty().isLength({ max: 100 }).escape(),
    body('description').trim().notEmpty().isLength({ max: 500 }).escape(),
    body('members').optional().isArray({ max: 100 }),
    body('members.*').optional().isMongoId(),
  ],
  rejectInvalidRequest,
  async (request: Request, response: Response, next: NextFunction) => {
  try {
    const team = await TeamModel.create(request.body);
    const populatedTeam = await TeamModel.findById(team._id).populate('members', 'name email').lean();
    response.status(201).json(populatedTeam);
  } catch (error) {
    next(error);
  }
  },
);

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

router.post(
  '/api/teams/:id/members',
  [param('id').isMongoId(), objectId('userId')],
  rejectInvalidRequest,
  async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { userId } = request.body as { userId?: string };

    if (!isValidObjectId(request.params.id) || !isValidObjectId(userId)) {
      response.status(400).json({ message: 'Valid team ID and userId are required' });
      return;
    }

    const memberUserId = userId as string;

    const user = await UserModel.findById(memberUserId).lean();

    if (!user) {
      response.status(404).json({ message: 'User not found' });
      return;
    }

    const team = await TeamModel.findByIdAndUpdate(
      request.params.id,
      { $addToSet: { members: memberUserId } },
      { returnDocument: 'after' },
    )
      .populate('members', 'name email')
      .lean();

    if (!team) {
      response.status(404).json({ message: 'Team not found' });
      return;
    }

    const badges = await awardTeamPlayerBadge(memberUserId);

    response.json({ ...team, badges });
  } catch (error) {
    next(error);
  }
  },
);

router.get('/api/activities', async (_request, response, next) => {
  try {
    const activities = await ActivityModel.find().sort({ date: -1 }).lean();
    response.json(activities);
  } catch (error) {
    next(error);
  }
});

router.post(
  '/api/activities',
  [
    objectId('userId'),
    body('activityType').isIn(['running', 'walking', 'strength']),
    body('duration').isFloat({ min: 0 }).toFloat(),
    body('distance').isFloat({ min: 0 }).toFloat(),
    body('calories').isFloat({ min: 0 }).toFloat(),
    body('date').isISO8601().toDate(),
  ],
  rejectInvalidRequest,
  async (request: Request, response: Response, next: NextFunction) => {
  try {
    const activity = await ActivityModel.create(request.body);
    await recalculateLeaderboardStandings();
    const badges = await calculateBadgeEligibilityAfterActivities(activity.userId);
    response.status(201).json({ activity, badges });
  } catch (error) {
    next(error);
  }
  },
);

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

router.get('/api/badges/:userId', async (request, response, next) => {
  try {
    if (!isValidObjectId(request.params.userId)) {
      response.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const badges = await getUserBadges(request.params.userId);
    response.json(badges);
  } catch (error) {
    next(error);
  }
});

router.get('/api/challenges', query('userId').optional().isMongoId(), rejectInvalidRequest, async (request, response, next) => {
  try {
    const challenges = await ChallengeModel.find({ active: true }).sort({ rewardPoints: -1 }).lean();
    const userId = typeof request.query?.userId === 'string' ? request.query.userId : '';

    if (!isValidObjectId(userId)) {
      response.json(challenges);
      return;
    }

    const userChallenges = await UserChallengeModel.find({ userId }).lean();
    const progressByChallenge = new Map(userChallenges.map((entry) => [entry.challengeId.toString(), entry]));

    response.json(
      challenges.map((challenge) => {
        const progress = progressByChallenge.get(challenge._id.toString());

        return {
          ...challenge,
          userProgress: progress?.progress ?? 0,
          completed: progress?.completed ?? false,
        };
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.post(
  '/api/challenges/:id/progress',
  [param('id').isMongoId(), objectId('userId'), body('progress').optional().isInt({ min: 1 }).toInt()],
  rejectInvalidRequest,
  async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { userId, progress } = request.body as { userId?: string; progress?: number };

    if (!isValidObjectId(request.params.id) || !isValidObjectId(userId)) {
      response.status(400).json({ message: 'Valid challenge ID and userId are required' });
      return;
    }

    const userChallenge = await updateChallengeProgress(request.params.id as string, userId as string, progress ?? 1);

    if (!userChallenge) {
      response.status(404).json({ message: 'Active challenge not found' });
      return;
    }

    response.json(userChallenge);
  } catch (error) {
    next(error);
  }
  },
);

router.get('/api/notifications/:userId', async (request, response, next) => {
  try {
    if (!isValidObjectId(request.params.userId)) {
      response.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const notifications = await NotificationModel.find({ userId: request.params.userId })
      .sort({ createdAt: -1 })
      .lean();
    response.json(notifications);
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