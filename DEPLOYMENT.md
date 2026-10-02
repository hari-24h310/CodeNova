# CodeNova Deployment

## 1. MongoDB Atlas

1. Create or select a MongoDB Atlas project and cluster.
2. Create a database user with a strong generated password. Grant only the permissions CodeNova needs on the deployment database.
3. In **Network Access**, add the Render outbound IP addresses if your Render plan provides stable egress IPs. Otherwise, allow `0.0.0.0/0` and rely on a strong database-user password because Render's outbound IP can vary.
4. Copy the driver connection string and replace its placeholders. Use the `codenova` database name, for example: `mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority`.

CodeNova passes `dbName: codenova` to Mongoose. Do not use a localhost MongoDB URI in production.

## 2. GitHub

1. Confirm `.env` is ignored and only `.env.example` files are tracked.
2. Remove any accidentally committed secret from Git history and rotate that credential in its provider before pushing.
3. Push the project to a private or public GitHub repository as appropriate.

From the project root, the push commands are:

```powershell
git init
git add .
git commit -m "Prepare CodeNova for production deployment"
git branch -M main
git remote add origin https://github.com/<account>/<repository>.git
git push -u origin main
```

Review `git status` and `git diff --cached` before the commit. Never add `.env` files.

## 3. Render backend

Create a **Web Service** connected to the repository with these settings:

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Runtime: Node

Set these Render environment variables. Do not commit their values:

```text
MONGODB_URI=<MongoDB Atlas connection string>
PORT=10000
JUDGE0_API_URL=<Judge0 API URL, if used by the execution provider>
JUDGE0_API_KEY=<Judge0 API key, if used by the execution provider>
GEMINI_API_KEY=<Gemini API key>
ADMIN_NAME=<initial admin name>
ADMIN_EMAIL=<initial admin email>
ADMIN_PASSWORD=<initial admin password>
STUDENT_DEFAULT_PASSWORD=<initial default student password>
FRONTEND_URL=https://<your-vercel-domain>
```

Render supplies `PORT` automatically; setting it explicitly is also supported. The server listens on `0.0.0.0` and exposes `GET /api/health`.

## 4. Vercel frontend

Create a Vercel project from the same repository with:

- Root Directory: `client`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Set this Vercel environment variable for Production (and Preview when needed):

```text
VITE_API_URL=https://<your-render-service>.onrender.com
```

The included `client/vercel.json` rewrites direct React Router routes to `index.html`, preventing SPA route 404 responses.

## 5. CORS and final configuration

After Vercel provides the final domain, set Render's `FRONTEND_URL` to that exact origin, including `https://` and excluding a trailing path. Redeploy the Render service after changing it. The backend permits local `http://localhost:5173` only when `FRONTEND_URL` is not set; in production, configure the Vercel origin explicitly.

## 6. Final testing

1. Open `https://<your-render-service>.onrender.com/api/health` and confirm it returns `{"status":"ok"}`.
2. Open the Vercel site and verify browser requests target the Render URL, not a relative `/api` URL.
3. Test student registration and login.
4. Test admin login, dashboard data, question management, and rankings.
5. Start an assessment, save progress, submit it, and view the result.
6. Test code execution and AI feedback with valid provider credentials.
7. Confirm a Render restart does not duplicate accounts or questions.
8. Check Render logs for a successful Atlas connection and no secret values.

The current execution route in this repository calls `tio.run` directly; it does not currently call Judge0. Configure and verify the actual execution provider before production if Judge0 is a hard requirement.