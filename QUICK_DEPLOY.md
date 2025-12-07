# Quick Deploy Checklist

## ⚡ 5-Minute Deployment to Render

### Before You Start
- ✅ Code committed: `git status` should be clean
- ✅ MongoDB connection string ready (from `.env`)
- ✅ GitHub account with your repo

### Step 1: Visit Render
Go to https://render.com/dashboard

### Step 2: Create Web Service
Click: **New** → **Web Service**

### Step 3: Connect GitHub
- Select `Schedule-Sync` repo
- Click **Connect**

### Step 4: Fill Settings
```
Name:           schedulesync
Environment:    Node
Branch:         main
Build Command:  npm install && npm run build
Start Command:  npm run start
```

### Step 5: Add Environment Variables
```
MONGODB_URI = (paste from .env)
NODE_ENV    = production
PORT        = 5000
```

### Step 6: Deploy
Click **Create Web Service** and wait 5-10 minutes

### Step 7: Get Your URL
Your app is at: `https://schedulesync-xxx.onrender.com`

## 🧪 Test It Works

### Backend Test
Visit: `https://your-url/health`  
Should see: `{"status":"ok"}`

### Frontend Test
Visit: `https://your-url`  
Should see: Login page

### Login Test
- Create account as student
- Check if database saves user
- Try booking a slot

## 📝 Important Files

- `.env` - Your config (don't commit)
- `.env.example` - Template (commit this)
- `server/index.ts` - Backend entry point
- `package.json` - Dependencies & scripts
- `vite.config.ts` - Frontend config

## 🚀 Future Deployments

Just push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render will auto-deploy! ✨

## 💡 Tips

- Keep `NODE_ENV` as `production` in Render
- Don't commit `.env` (it's in `.gitignore`)
- Free tier auto-pauses after 15 min inactivity
- Add your MongoDB IP to whitelist if it fails

## 🆘 If It Fails

1. **Check logs:** Service → Logs tab
2. **Verify MongoDB URI:** Paste into connection string field
3. **Restart service:** Manual Deploy → Deploy Latest Commit
4. **Check locally:** `npm run build && npm run start`

## ✨ You're Done!

Share your live URL: `https://schedulesync-xxx.onrender.com`

Students and faculty can now use your app! 🎉
