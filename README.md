# Fairway Edge Predictions -- Next.js version

React/Next.js rebuild of the Streamlit dashboard, deployable to Vercel.

## What changed vs. the Streamlit version

- All AWS S3 access and DataGolf API calls now happen in **API routes**
  (`app/api/predictions`, `app/api/live-stats`, `app/api/odds`) which run
  server-side on Vercel. Your AWS keys and DataGolf key are never sent to
  the browser -- only the processed JSON results are.
- The checkpoint buttons, table, and live leaderboard are a React client
  component (`app/page.js`) that calls those three API routes and merges
  the data client-side, same logic as the Streamlit version (name
  normalization, live-probability adjustment, edge calculation).
- Column-naming differences across pipeline versions (`cum_rank` vs
  `r1_rank`, `p_top10` vs `p`) are normalized server-side in `lib/s3.js`,
  same idea as the Streamlit app's `normalize_columns()`.
- The "only ever show top 10" safety net is enforced server-side in the
  predictions API route, regardless of how many rows the source CSV has.

## Local development

```bash
npm install
cp .env.local.example .env.local
# edit .env.local with your real AWS keys, bucket name, and DataGolf key
npm run dev
```

Visit http://localhost:3000

## Deploying to Vercel

1. Push this project to a GitHub repo (e.g. a new `golf-dashboard` repo,
   separate from your existing `golf-frontend` Streamlit repo).
2. Go to https://vercel.com -> **Add New Project** -> import that repo.
3. Vercel auto-detects Next.js -- no build config changes needed.
4. Before deploying, go to **Project Settings -> Environment Variables**
   and add all five variables from `.env.local.example` with your real
   values (do this for Production, Preview, and Development
   environments, or at minimum Production).
5. Click **Deploy**.

Every time you push to the repo's main branch, Vercel automatically
rebuilds and redeploys -- same "git push, auto-updates" pattern you
already use for the Streamlit app on Streamlit Cloud.

## IAM permissions needed

The AWS credentials used here only need read access to the bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::rounds-golf-data",
        "arn:aws:s3:::rounds-golf-data/*"
      ]
    }
  ]
}
```

Consider creating a dedicated IAM user scoped to just this read-only
policy for the dashboard, rather than reusing broader credentials.
