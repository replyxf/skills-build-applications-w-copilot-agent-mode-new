# Deployment Guide

## Configuration

Copy `backend/.env.example` and `frontend/.env.example` to `.env` in their respective directories. Do not commit secrets.

| Variable | Tier | Description |
| --- | --- | --- |
| `PORT` | Backend | HTTP port; defaults to `8000` |
| `MONGODB_URI` | Backend | MongoDB connection string for `octofit_db` |
| `CODESPACE_NAME` | Backend | Optional Codespace name used to derive forwarded URLs |
| `NODE_ENV` | Backend | Use `production` in deployed environments |
| `ALLOWED_ORIGINS` | Backend | Comma-separated exact frontend origins allowed by CORS |
| `VITE_API_BASE_URL` | Frontend | Public API URL embedded during the Vite build |

## Local containers

Run `docker compose -f octofit-tracker/docker-compose.yml up --build`. The frontend is available at `http://localhost:5173`, the API at `http://localhost:8000`, and MongoDB remains private on the Compose network. Stop with `docker compose -f octofit-tracker/docker-compose.yml down`; add `-v` only when intentionally deleting database data.

## Production

1. Provision MongoDB with authentication, backups, and network restrictions.
2. Build the frontend with the public API URL: `VITE_API_BASE_URL=https://api.example.com npm run build --prefix octofit-tracker/frontend`.
3. Build the API image: `docker build -t octofit-backend octofit-tracker/backend`.
4. Run the API with `NODE_ENV=production`, `MONGODB_URI`, and `ALLOWED_ORIGINS=https://app.example.com`; expose container port `8000` through TLS termination.
5. Serve `frontend/dist` from a CDN or use the frontend Dockerfile. Update the CSP `connect-src` in `frontend/nginx.conf` and `vite.config.js` when using a custom API domain.
6. Verify `GET /health`, browser CORS behavior, and application routes after deployment.

Pushes to `main` run `.github/workflows/octofit-ci-cd.yml`. After compilation, lint, and production-build gates pass, the workflow publishes `ghcr.io/<owner>/octofit-backend:latest` and a commit-tagged image. Connect the registry image to the chosen container platform's deploy hook for rollout. Pull requests run validation but never publish.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| API exits during startup | Confirm `MONGODB_URI`, DNS/network access, and MongoDB credentials |
| Browser reports a CORS failure | Add the frontend's exact scheme and host to `ALLOWED_ORIGINS` |
| CSP blocks API requests | Add the API origin to `connect-src` in the production web-server policy |
| API returns `429` | Wait for the 15-minute rate-limit window or investigate excessive client retries |
| Deep frontend links return `404` | Configure the host to fall back to `index.html`, as in `frontend/nginx.conf` |
| Old UI remains after release | Confirm `sw.js` is served with `Cache-Control: no-cache`, then reload after activation |
| Containers cannot reach MongoDB | Use `mongodb://mongodb:27017/octofit_db` inside Compose, not `localhost` |

## Performance

- Put static frontend assets behind a CDN with compression and immutable caching; do not cache `index.html` or `sw.js` long-term.
- Enable HTTP/2 or HTTP/3 and TLS at the ingress.
- Add MongoDB indexes for frequently filtered fields as data volume grows, and inspect slow-query logs before adding speculative indexes.
- Paginate list endpoints before datasets become large; the current endpoints return complete collections.
- Keep source maps private in production and monitor bundle-size output from `npm run build`.
- Scale API replicas behind a load balancer and use centralized JSON-log collection for latency and error monitoring.