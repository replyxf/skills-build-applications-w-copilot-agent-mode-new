import { Types } from 'mongoose';

import { Activity, ActivityModel } from '../models/Activity.js';
import { LeaderboardModel } from '../models/Leaderboard.js';
import { TeamModel } from '../models/Team.js';

interface UserStats {
  userId: Types.ObjectId;
  points: number;
  totalDistance: number;
  totalDuration: number;
}

interface PopulatedMember {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

export async function recalculateLeaderboardStandings() {
  const activities = await ActivityModel.find().lean();
  const statsByUser = new Map<string, UserStats>();

  for (const activity of activities) {
    const userId = activity.userId as Types.ObjectId;
    const key = userId.toString();
    const existing = statsByUser.get(key) ?? {
      userId,
      points: 0,
      totalDistance: 0,
      totalDuration: 0,
    };

    existing.points += LeaderboardModel.calculatePoints(activity as Activity);
    existing.totalDistance += activity.distance;
    existing.totalDuration += activity.duration;
    statsByUser.set(key, existing);
  }

  const standings = [...statsByUser.values()]
    .sort((left, right) => right.points - left.points)
    .map((stats, index) => ({
      ...stats,
      points: Number(stats.points.toFixed(2)),
      totalDistance: Number(stats.totalDistance.toFixed(2)),
      rank: index + 1,
      lastUpdated: new Date(),
    }));

  await LeaderboardModel.deleteMany({});

  if (standings.length > 0) {
    await LeaderboardModel.insertMany(standings);
  }

  return LeaderboardModel.find().populate('userId', 'name email').sort({ points: -1, rank: 1 }).lean();
}

export async function getTeamLeaderboard() {
  const [teams, standings] = await Promise.all([
    TeamModel.find().populate('members', 'name email').lean(),
    LeaderboardModel.find().lean(),
  ]);

  const statsByUser = new Map(standings.map((entry) => [entry.userId.toString(), entry]));

  return teams
    .map((team) => {
      const members = team.members as unknown as PopulatedMember[];
      const totals = members.reduce(
        (current, member) => {
          const stats = statsByUser.get(member._id.toString());

          return {
            points: current.points + (stats?.points ?? 0),
            totalDistance: current.totalDistance + (stats?.totalDistance ?? 0),
            totalDuration: current.totalDuration + (stats?.totalDuration ?? 0),
          };
        },
        { points: 0, totalDistance: 0, totalDuration: 0 },
      );

      return {
        ...team,
        points: Number(totals.points.toFixed(2)),
        totalDistance: Number(totals.totalDistance.toFixed(2)),
        totalDuration: totals.totalDuration,
      };
    })
    .sort((left, right) => right.points - left.points)
    .map((team, index) => ({ ...team, rank: index + 1 }));
}