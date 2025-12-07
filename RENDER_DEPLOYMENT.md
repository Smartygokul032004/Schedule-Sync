# SchedulSync - Render.com Deployment (Step-by-Step)

This guide walks you through deploying SchedulSync to Render.com in 15 minutes.

## Prerequisites

✅ GitHub account (you already have one)  
✅ MongoDB Atlas account with your connection string  
✅ Project pushed to GitHub  

## Step 1: Sign Up on Render.com

1. Go to https://render.com
2. Click **"Sign up"**
3. Choose **"Sign up with GitHub"**
4. Click **"Authorize Render"** to let Render access your GitHub
5. Complete setup and go to Dashboard

## Step 2: Connect Your GitHub Repository

1. On Render Dashboard, click **"New +"** 
2. Select **"Web Service"**
3. Click **"Connect a repository"**
4. Find `Schedule-Sync` and click **"Connect"**
5. Click **"Yes, grant access"** to authorize

## Step 3: Configure the Web Service

Fill in these details:

### Basic Settings
- **Name:** `schedulesync`
- **Environment:** `Node`
- **Branch:** `main`
- **Build Command:** 
  ```
  npm install && npm run build
  ```
- **Start Command:**
  ```
  npm run start
  ```

### Advanced Settings
- **Region:** Choose closest to you (e.g., `Oregon` for USA)
- **Instance Type:** `Starter` (free tier, auto-pauses)

### Environment Variables

Click **"Add Environment Variable"** for each:

| Key | Value | Notes |
|-----|-------|-------|
| `MONGODB_URI` | Your MongoDB connection string | Copy from your `.env` file |
| `NODE_ENV` | `production` | Required for frontend serving |
| `PORT` | `5000` | Default port |

**To copy MongoDB URI:**
```
From .env file:
MONGODB_URI=mongodb+srv://smarty_db:smarty123@cluster0.jg7eazy.mongodb.net/?appName=Cluster0
```

### Health Check (Optional but Recommended)
- **Health Check Path:** `/health`
- **Health Check Protocol:** `HTTP`

## Step 4: Deploy!

1. Click **"Create Web Service"**
2. Watch the deployment logs
3. Wait for **"Your service is live!"** message
4. Your URL will be: `https://schedulesync-xxx.onrender.com`

**Deployment time: 5-10 minutes**

## Step 5: Verify Deployment

### Test Backend
```
Visit: https://your-render-url.onrender.com/health
Expected: {"status":"ok"}
```

### Test Frontend
```
Visit: https://your-render-url.onrender.com
Expected: SchedulSync login page
```

### Test API Connection
1. Open the website
2. Try logging in or creating an account
3. Check browser console for any errors
4. If it works, you're all set! 🎉

## Step 6: Connect Custom Domain (Optional)

1. Go to your Render service settings
2. Scroll to **"Custom Domain"**
3. Add your domain (e.g., `schedulesync.com`)
4. Follow DNS configuration instructions

## Step 7: Monitor Your App

### View Logs
- Go to your service page
- Click **"Logs"** tab
- See real-time logs

### View Metrics
- Click **"Metrics"** tab
- See CPU, RAM, network usage

### Get Alerts
- Click **"Alerts"**
- Set up email notifications for downtime

## Troubleshooting

### Deployment Failed
**Error: "Build failed"**
- Check build logs for specific error
- Ensure `npm run build` works locally
- Verify TypeScript: `npm run typecheck`

**Error: "Cannot connect to MongoDB"**
- Copy MongoDB URI correctly (no typos)
- Check MongoDB Atlas IP whitelist
- Ensure database credentials are correct

### App Won't Start
**Error: "Service crashed"**
- Check logs for the error
- Verify environment variables are set
- Test locally first: `npm run server`

**Blank page or 404**
- Hard refresh browser (Ctrl+Shift+R)
- Check console for API connection errors
- Verify backend URL in frontend config

### API Connection Issues
**Error: "Failed to fetch from /api"**
- Backend might not be running
- Check service logs
- Verify CORS is enabled (it is)
- Clear browser cache

**Error: "POST /api/auth/login 404"**
- Restart the service (might need rebuild)
- Check all routes are registered
- Verify routes/auth.ts exists

## Important Notes

### Free Tier Behavior
- Service auto-spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- To keep it active 24/7, upgrade to paid plan (~$7/month)

### Cold Starts
When app spins down:
1. First request boots it up (~30 seconds)
2. Subsequent requests are instant
3. This is normal on free tier

### Scaling
If you get more users:
1. Upgrade to paid plan
2. Add more instances if needed
3. Monitor performance in Metrics tab

## Git Workflow

Any time you push to GitHub, Render automatically deploys:

```bash
# Make changes locally
git add .
git commit -m "Feature: Add something cool"
git push origin main

# Render detects push
# Automatically rebuilds and deploys
# Check logs to see progress
```

## Next: Environment Variables Management

For security, don't commit `.env`:

```bash
# Already in .gitignore (good!)
# But add .env.example for reference
echo "MONGODB_URI=your_uri_here" > .env.example
git add .env.example
git commit -m "Add env template"
git push origin main
```

## Useful Render Commands

### Restart Service
1. Go to service settings
2. Click **"Manual Deploy"** → **"Deploy Latest Commit"**

### View Logs
```
Service page → "Logs" tab → Real-time streaming
```

### Check Status
```
Visit: https://your-url/health
Should return: {"status":"ok"}
```

## Success Checklist

- [x] GitHub account connected
- [x] MongoDB URI set in environment
- [x] Service deployed and running
- [x] Backend `/health` endpoint working
- [x] Frontend loading without errors
- [x] Can login/signup
- [x] Database operations working
- [x] API calls from frontend working

---

## Support

If deployment fails:

1. **Check Render Logs:** Service → Logs tab
2. **Check TypeScript:** Run `npm run typecheck` locally
3. **Check Dependencies:** Run `npm install` locally
4. **Check Environment Variables:** Verify all are set in Render dashboard
5. **Check MongoDB:** Test connection string locally

## Your Live App!

Once deployed, share this URL with others:
```
https://schedulesync-xxx.onrender.com
```

They can now:
- Sign up as student or faculty
- Create slots and bookings
- Manage their profile
- Receive notifications

**Congratulations! Your app is live! 🚀**
