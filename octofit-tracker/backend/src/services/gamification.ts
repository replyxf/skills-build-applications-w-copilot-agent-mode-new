import { Types } from 'mongoose';

import { ActivityModel } from '../models/Activity.js';
import { BadgeModel } from '../models/Badge.js';
import { ChallengeModel } from '../models/Challenge.js';
import { LeaderboardModel } from '../models/Leaderboard.js';
import { NotificationModel } from '../models/Notification.js';
import { UserBadgeModel } from '../models/UserBadge.js';
import { UserChallengeModel } from '../models/UserChallenge.js';

const badgeDefinitions = [
  {
    badgeId: 'first-step',
    name: 'First Step',
    description: 'Logged your first activity.',
    icon: 'shoe',
    criteria: 'Awarded when a user logs their first activity.',
  },
  {
    badgeId: 'runner',
    name: 'Runner',
    description: 'Reached 10 km of running distance.',
    icon: 'run',
    criteria: 'Awarded when total running distance is at least 10 km.',
  },
  {
    badgeId: 'team-player',
    name: 'Team Player',
    description: 'Joined a team.',
    icon: 'team',
    criteria: 'Awarded when a user is added to a team.',
  },
  {
    badgeId: 'champion',
    name: 'Champion',
    description: 'Entered the top 10 leaderboard.',
    icon: 'trophy',
    criteria: 'Awarded when a user reaches leaderboard rank 10 or better.',
  },
  {
    badgeId: 'iron-will',
    name: 'Iron Will',
    description: 'Completed 30 strength sessions.',
    icon: 'dumbbell',
    criteria: 'Awarded when a user completes 30 strength activities.',
  },
];

export async function ensureDefaultBadges() {
  await Promise.all(
    badgeDefinitions.map((badge) =>
      BadgeModel.updateOne({ badgeId: badge.badgeId }, { $setOnInsert: badge }, { upsert: true }),
    ),
  );
}

async function awardBadge(userId: Types.ObjectId | string, badgeId: string) {
  await ensureDefaultBadges();

  const badge = await BadgeModel.findOne({ badgeId });

  if (!badge) {
    return null;
  }

  const result = await UserBadgeModel.updateOne(
    { userId, badgeId: badge._id },
    { $setOnInsert: { userId, badgeId: badge._id, earnedAt: new Date() } },
    { upsert: true },
  );

  if (result.upsertedCount === 0) {
    return null;
  }

  await NotificationModel.create({
    userId,
    type: 'badge',
    message: `Badge earned: ${badge.name}`,
  });

  return badge;
}

export async function calculateBadgeEligibilityAfterActivities(userId: Types.ObjectId | string) {
  const [activityCount, runningActivities, strengthCount, leaderboardEntry] = await Promise.all([
    ActivityModel.countDocuments({ userId }),
    ActivityModel.find({ userId, activityType: 'running' }).lean(),
    ActivityModel.countDocuments({ userId, activityType: 'strength' }),
    LeaderboardModel.findOne({ userId }).lean(),
  ]);

  const runningDistance = runningActivities.reduce((total, activity) => total + activity.distance, 0);
  const earnedBadges = [];

  if (activityCount >= 1) {
    const badge = await awardBadge(userId, 'first-step');
    if (badge) earnedBadges.push(badge);
  }

  if (runningDistance >= 10) {
    const badge = await awardBadge(userId, 'runner');
    if (badge) earnedBadges.push(badge);
  }

  if (leaderboardEntry && leaderboardEntry.rank <= 10) {
    const badge = await awardBadge(userId, 'champion');
    if (badge) earnedBadges.push(badge);
  }

  if (strengthCount >= 30) {
    const badge = await awardBadge(userId, 'iron-will');
    if (badge) earnedBadges.push(badge);
  }

  return earnedBadges;
}

export async function awardTeamPlayerBadge(userId: Types.ObjectId | string) {
  const badge = await awardBadge(userId, 'team-player');

  await NotificationModel.create({
    userId,
    type: 'team',
    message: 'You joined a team.',
  });

  return badge ? [badge] : [];
}

export async function getUserBadges(userId: Types.ObjectId | string) {
  await ensureDefaultBadges();

  const [badges, earnedBadges] = await Promise.all([
    BadgeModel.find().sort({ name: 1 }).lean(),
    UserBadgeModel.find({ userId }).populate('badgeId').lean(),
  ]);
  const earnedBadgeIds = new Set(
    earnedBadges.map((earnedBadge) => {
      const badge = earnedBadge.badgeId as unknown as { badgeId: string };
      return badge.badgeId;
    }),
  );

  return badges.map((badge) => ({
    ...badge,
    earned: earnedBadgeIds.has(badge.badgeId),
    earnedAt: earnedBadges.find((earnedBadge) => {
      const earned = earnedBadge.badgeId as unknown as { badgeId: string };
      return earned.badgeId === badge.badgeId;
    })?.earnedAt,
  }));
}

export async function updateChallengeProgress(challengeId: string, userId: string, progress = 1) {
  const challenge = await ChallengeModel.findById(challengeId).lean();

  if (!challenge || !challenge.active) {
    return null;
  }

  const existing = await UserChallengeModel.findOne({ challengeId, userId });
  const nextProgress = Math.min((existing?.progress ?? 0) + progress, challenge.goal);
  const completed = nextProgress >= challenge.goal;
  const wasCompleted = existing?.completed ?? false;

  const userChallenge = await UserChallengeModel.findOneAndUpdate(
    { challengeId, userId },
    {
      $set: {
        progress: nextProgress,
        completed,
        ...(completed && !wasCompleted ? { completedAt: new Date() } : {}),
      },
      $setOnInsert: { startedAt: new Date() },
    },
    { returnDocument: 'after', upsert: true },
  )
    .populate('challengeId')
    .lean();

  if (completed && !wasCompleted) {
    await NotificationModel.create({
      userId,
      type: 'challenge',
      message: `Challenge complete: ${challenge.name}. Reward: ${challenge.rewardPoints} points.`,
    });
  }

  return userChallenge;
}