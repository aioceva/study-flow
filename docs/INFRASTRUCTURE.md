# Study Flow — Infrastructure

## Git Repository
- Platform: GitHub
- URL: https://github.com/aioceva/study-flow

## Deployment
- Platform: Vercel
- Project dashboard: https://vercel.com/aiocevas-projects/study-flow
- Live URL: https://poc-study-flow.vercel.app/bobi

## Deploy process
- Vercel auto-deploys on push to main branch
- To trigger redeploy: `git push origin main`

## Notes
- No login — each child has their own URL (e.g. /bobi)
- GitHub is used as the database (sessions.json stored in repo)
