Dockerizing & Deploying to Vercel

1) Build and run locally with Docker

# Build the image (from project root)
docker build -t dcf-creation-app:latest .

# Run the container
docker run -p 3000:3000 --env NODE_ENV=production dcf-creation-app:latest

Open http://localhost:3000

Build with a DATABASE_URL during build (if Prisma or build steps need it):

# Build and pass DATABASE_URL as a build-arg
# Replace <your_database_url> with your connection string
docker build --build-arg DATABASE_URL="<your_database_url>" -t dcf-creation-app:latest .

# Run using an env file (create a .env file with DATABASE_URL and other vars)
# Docker will not read .env automatically for run; use --env-file
docker run -p 3000:3000 --env-file .env dcf-creation-app:latest

Security note: avoid hardcoding production DB credentials in build logs or in public CI. Use secret management in your CI provider (or Vercel environment variables) instead.

2) Deploy to Vercel using Dockerfile

Option A — Connect repo to Vercel (recommended)
- Push your repository to GitHub/GitLab/Bitbucket.
- On Vercel dashboard, "New Project" → Import your repo.
- In the Project Settings -> General -> Build & Output Settings, Vercel will detect a Dockerfile and build using it.
- Set any Environment Variables under Settings -> Environment Variables.
- Deploy; Vercel will run docker build and serve the container.

Option B — Use Vercel CLI with Dockerfile (advanced)
- Install Vercel CLI: `npm i -g vercel`.
- Run `vercel` and follow prompts; Vercel will detect Dockerfile and build.

Notes & tips
- Ensure `package.json` has a `start` script that runs a Node server (Next.js: `next start`).
- If you want static export, consider `next export` and serving via a static server.
- For serverless functions, Vercel's standard platform is often simpler than custom Docker.
- If you run into build issues on Vercel, inspect build logs and ensure all build deps are included in `package.json`.

Provisioning Vercel Postgres and wiring Prisma

1) Provision Vercel Postgres
- Go to https://vercel.com and open your project dashboard.
- In the left sidebar, go to "Integrations" -> "Vercel Postgres" (or visit the Marketplace and add Vercel Postgres).
- Create a new Postgres database (pick a plan). After creation, Vercel will provide a connection string.

2) Set DATABASE_URL in Vercel
- In your Project -> Settings -> Environment Variables, add a variable named `DATABASE_URL` and paste the connection string.
- Add it for both "Build" and "Production" (and Preview if desired).

3) Add DATABASE_URL to GitHub secrets (for migrations in CI)
- In your GitHub repo, go to Settings -> Secrets and variables -> Actions -> New repository secret.
- Name it `DATABASE_URL` and set the value to the same connection string.

4) Apply Prisma migrations
- Using the workflow `.github/workflows/prisma-deploy.yml` created in this repo, when you push to `main` (or `master`), GitHub Actions will run `npx prisma migrate deploy` against the DATABASE_URL from secrets and apply migrations.

5) Notes
- For development you can connect your local app to Vercel Postgres by setting your local `.env` DATABASE_URL (but avoid using production credentials locally).
- For quick schema syncing in development you can run `npx prisma db push` (not recommended for production schema evolution).

Security reminder: never commit credentials or the .env file to the repository. Use Vercel environment variables and GitHub secrets.
