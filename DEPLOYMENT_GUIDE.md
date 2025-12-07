# SchedulSync - Deployment Guide

Choose your platform:
- **Render** (Recommended) - Best for full-stack apps
- **Vercel** - Best for frontend, requires separate backend hosting

---

## 🚀 Option 1: Deploy to Render (Recommended)

Render is ideal for your project because it handles both frontend and backend in one place.

### Step 1: Prepare Your Project

```bash
# Make sure everything is committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 2: Create Render Account & Connect GitHub

1. Go to [render.com](https://render.com)
2. Click "Sign up" and choose "Sign up with GitHub"
3. Authorize Render to access your GitHub account
4. Go to Dashboard → "New Web Service"

### Step 3: Deploy Backend Service

1. Click **"New Web Service"**
2. Select your GitHub repository `Schedule-Sync`
3. Configure the service:
   - **Name:** `schedulesync-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run server`
   - **Branch:** `main`

4. Add Environment Variables:
   - Click "Add Environment Variable"
   - Add `MONGODB_URI` = (your MongoDB connection string from .env)
   - Add `PORT` = `5000`
   - Add `NODE_ENV` = `production`

5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes)
7. Note the backend URL (e.g., `https://schedulesync-backend.onrender.com`)

### Step 4: Update Frontend API URL

1. Create a `.env.production` file in your project root:
   ```
   VITE_API_URL=https://schedulesync-backend.onrender.com/api
   ```

2. Update `src/utils/api.ts` to use environment variable:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
   
   const api = axios.create({
     baseURL: API_BASE_URL,
   });
   ```

3. Push these changes:
   ```bash
   git add .
   git commit -m "Configure production API URL"
   git push origin main
   ```

### Step 5: Deploy Frontend (Static)

The backend now serves the frontend. Just rebuild:

1. In Render Dashboard, go to your backend service
2. Click **"Manual Deploy"** → **"Deploy Latest Commit"**

Or push to main:
```bash
git push origin main
```

### Step 6: Verify Deployment

1. Go to your service URL
2. Check the Logs tab to ensure everything is running
3. Visit `https://schedulesync-backend.onrender.com/health`
4. Should see: `{"status":"ok"}`

---

## 🌐 Option 2: Deploy to Vercel (Frontend Only)

If you prefer Vercel, you'll need to host the backend elsewhere (Render, Heroku, etc.).

### For Frontend on Vercel:

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your `Schedule-Sync` repository
5. Configure:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:**
     - `VITE_API_URL` = (your backend URL)

### For Backend (use Render simultaneously):

Deploy the backend to Render following Option 1, then use that URL in Vercel's environment variables.

---

## 📋 Complete Setup Checklist

### Before Deployment
- [ ] All code committed to git
- [ ] `.env` file has correct MongoDB URI
- [ ] No hardcoded environment variables in code
- [ ] `npm run build` works locally
- [ ] `npm run server` starts without errors
- [ ] No console errors in browser

### After Deployment
- [ ] Backend service is running (`/health` endpoint works)
- [ ] Frontend loads without errors
- [ ] Can login/signup
- [ ] Can create slots
- [ ] Can book appointments
- [ ] Notifications display correctly
- [ ] Database operations work

---

## 🔧 Environment Variables Reference

### Required Variables
```
MONGODB_URI=mongodb+srv://smarty_db:smarty123@cluster0.jg7eazy.mongodb.net/?appName=Cluster0
PORT=5000
NODE_ENV=production
```

### Optional Variables
```
VITE_API_URL=https://your-backend-url/api
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB URI is correct
- Verify all dependencies are installed
- Check logs for specific errors
- Run `npm install` on Render if needed

### Frontend can't connect to API
- Verify backend URL in environment variables
- Check CORS is enabled in server (it is)
- Check network tab in browser DevTools
- Verify backend is actually running

### Database connection fails
- Test MongoDB URI locally: `mongosh "your-uri"`
- Ensure IP whitelist includes Render's IPs
- Check MongoDB Atlas is running
- Verify credentials are correct

### Build fails
- Ensure TypeScript compiles locally: `npm run typecheck`
- Check for missing dependencies: `npm install`
- Verify all imports are correct
- Look at build logs for specific errors

---

## 📊 Monitoring After Deployment

### On Render Dashboard
1. Go to your service
2. Click **"Metrics"** to see:
   - CPU usage
   - Memory usage
   - Requests per minute
   - Error rates

### Add Logging
Already configured: Check logs by clicking **"Logs"** tab

### Health Checks
The `/health` endpoint is automatically monitored by Render.

---

## 🔐 Security Checklist

- [x] Environment variables are not in git
- [x] MongoDB credentials are in .env (not committed)
- [x] JWT authentication is enabled
- [x] Password hashing with bcryptjs
- [x] CORS properly configured
- [x] No sensitive data in frontend code

---

## 💰 Cost Estimate

### Render (Recommended)
- **Free Tier:** Limited (auto-paused)
- **Paid (Pay-as-you-go):** ~$7/month for backend
- **MongoDB Atlas:** Free tier available (512MB)
- **Total:** ~$7-15/month

### Vercel + Render
- **Vercel:** Free
- **Render Backend:** ~$7/month
- **MongoDB Atlas:** Free
- **Total:** ~$7/month

---

## 📞 Getting Help

### Common Issues & Solutions

**"MONGODB_URI is undefined"**
- Solution: Add environment variable in Render dashboard

**"Cannot GET /"**
- Solution: Frontend build not working, check build logs

**"CORS error from localhost"**
- Solution: This is normal in production, check frontend URL

**"Connection timeout"**
- Solution: MongoDB IP whitelist, check Atlas settings

---

## ✅ Next Steps After Deployment

1. Test all features thoroughly
2. Set up monitoring and alerts
3. Configure custom domain (optional)
4. Set up automated backups for MongoDB
5. Enable email notifications (requires email service)
6. Monitor costs and performance

---

## 🚀 Quick Deploy Commands

```bash
# Local testing before deploy
npm run build
npm run preview

# Deploy to Render
git add .
git commit -m "Ready for production"
git push origin main
# Then trigger deploy from Render dashboard

# Check status
curl https://your-backend-url/health
```

---

**Your app will be live within 5-10 minutes! 🎉**
