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
