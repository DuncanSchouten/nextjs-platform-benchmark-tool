# Benchmark Dashboard

A Next.js dashboard for monitoring build and deployment performance across Pantheon, Vercel, and Netlify.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Requires `DATABASE_URL` environment variable pointing to the Cloud SQL PostgreSQL instance.

## Configuration

Dashboard settings are controlled via `config.json`:

```json
{
  "targets": {
    "pantheon": 300,
    "vercel": null,
    "netlify": null
  },
  "defaultRange": "7d",
  "pageSize": 25,
  "rollingAverageWindow": 5
}
```

### Parameters

| Parameter | Description | Default |
|---|---|---|
| `targets` | Per-platform target deploy time in seconds. Set to `null` to hide the target line for that platform. | `{ "pantheon": 300 }` |
| `defaultRange` | Default time range when loading the dashboard. Options: `24h`, `7d`, `30d`, `all` | `7d` |
| `pageSize` | Number of runs per page in the recent runs table | `25` |
| `rollingAverageWindow` | Number of data points for the rolling average trend line | `5` |

### URL Parameter Overrides

Target values can be overridden via URL query parameters for ad-hoc comparisons without modifying `config.json`:

```
https://your-dashboard-url/?target_pantheon=250
https://your-dashboard-url/?target_pantheon=120&target_vercel=60
```

The time range and pagination are also controlled via URL parameters, making dashboard views shareable:

```
?range=24h          # Last 24 hours
?range=7d           # Last 7 days (default)
?range=30d          # Last 30 days
?range=all          # All time
?range=custom&start=2026-03-01&end=2026-03-15  # Custom date range
?page=2             # Page 2 of recent runs
```

## Chart Features

The build time trends chart supports toggleable overlays:

- **Rolling Average**: A smoothed trend line computed as a sliding window average over the configured number of data points.
- **Target Line**: A horizontal reference line per platform showing the target deploy time.

Both can be toggled on/off via checkboxes above the chart.

### Smart Aggregation

The chart automatically adjusts data granularity based on the selected time range:

| Time Range | Aggregation | Description |
|---|---|---|
| 24 hours | None | Individual data points |
| 7 days | Hourly | Average per hour |
| 30 days / All | Daily | Average per day |

## API Routes

The dashboard exposes three API endpoints for data access:

- `GET /api/chart?range=7d` - Chart data with smart aggregation
- `GET /api/runs?range=7d&page=1&pageSize=25` - Paginated benchmark runs
- `GET /api/stats?range=7d` - Platform statistics

All endpoints support `?range=custom&start=ISO&end=ISO` for custom date ranges.

## Deployment

Deployed on Pantheon. Requires the `DATABASE_URL` environment variable set to the Cloud SQL connection string.
