# OctoFit Tracker API

The API listens on port `8000`. All request and response bodies use JSON.

## System

| Method | Path | Description | Success |
| --- | --- | --- | --- |
| GET | `/health` | Process health and uptime | `200` |
| GET | `/api/` | API identity | `200` |
| GET | `/api/health` | Backward-compatible API health | `200` |

## Users and teams

| Method | Path | Body | Success |
| --- | --- | --- | --- |
| GET | `/api/users` | None | `200`, all users |
| POST | `/api/users` | `{ "name": string, "email": string }` | `201`, created user |
| GET | `/api/users/:id` | None | `200`, user |
| GET | `/api/teams` | None | `200`, teams with members |
| POST | `/api/teams` | `{ "name": string, "description": string, "members"?: string[] }` | `201`, created team |
| GET | `/api/teams/:id` | None | `200`, team |
| POST | `/api/teams/:id/members` | `{ "userId": string }` | `200`, updated team and badges |

## Activity and competition

| Method | Path | Body or query | Success |
| --- | --- | --- | --- |
| GET | `/api/activities` | None | `200`, newest activities first |
| POST | `/api/activities` | `{ "userId": string, "activityType": "running" \| "walking" \| "strength", "duration": number, "distance": number, "calories": number, "date": ISO-8601 string }` | `201`, activity and badges |
| GET | `/api/activities/:id` | None | `200`, activity |
| GET | `/api/leaderboard` | None | `200`, user standings |
| GET | `/api/leaderboard/teams` | None | `200`, team standings |
| GET | `/api/leaderboard/:userId` | None | `200`, user standing |
| GET | `/api/badges/:userId` | None | `200`, earned badges |
| GET | `/api/challenges` | Optional `userId` query | `200`, active challenges and optional progress |
| POST | `/api/challenges/:id/progress` | `{ "userId": string, "progress"?: positive integer }` | `200`, challenge progress |
| GET | `/api/notifications/:userId` | None | `200`, newest notifications first |
| GET | `/api/workouts` | None | `200`, workout suggestions |

Invalid input returns `400`; missing records return `404`; unique conflicts return `409`; rate limits return `429`; unexpected failures return `500`. Validation errors include an `errors` array. Production `500` responses do not expose internal exception details.