# Deploy Backend to Vercel

## 🚀 Quick Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Backend Directory
```bash
cd backend
vercel
```

### 4. Follow the Prompts
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N`
- **What's your project's name?** → `p-ker-buddy-backend` (or any name)
- **In which directory is your code located?** → `./` (current directory)
- **Want to override the settings?** → `N`

### 5. Get Your Backend URL
After deployment, Vercel will give you a URL like:
`https://p-ker-buddy-backend-xxxxx.vercel.app`

### 6. Update Frontend to Use New Backend
Edit `src/App.js` and change the backend URL:
```javascript
const BACKEND_URL = 'https://your-vercel-backend-url.vercel.app';
```

## 📁 File Structure for Vercel
```
backend/
├── api/
│   ├── index.py          # Main Flask app for Vercel
│   └── requirements.txt  # Python dependencies
├── vercel.json          # Vercel configuration
└── app.py              # Original Flask app (for local development)
```

## 🔧 Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ],
  "env": {
    "FLASK_ENV": "production"
  }
}
```

### api/requirements.txt
```
Flask==2.3.3
Flask-CORS==4.0.0
```

## 🌐 Environment Variables
No environment variables needed for this deployment.

## 🔄 Updating Deployment
To update your deployment:
```bash
cd backend
vercel --prod
```

## 🧪 Testing Your Deployment
1. Test health endpoint: `https://your-backend-url.vercel.app/api/health`
2. Test analyze endpoint with POST request to `/api/analyze`

## 🎯 Benefits of Vercel Deployment
- ✅ **Always Online**: No need to run backend locally
- ✅ **Free Tier**: Generous free tier for personal projects
- ✅ **Auto-scaling**: Handles traffic automatically
- ✅ **Global CDN**: Fast response times worldwide
- ✅ **Easy Updates**: Simple deployment process

## 🚨 Troubleshooting

### Common Issues:
1. **Import Errors**: Make sure all imports are in `api/index.py`
2. **Timeout Errors**: Vercel has 10-second timeout limit
3. **CORS Issues**: CORS is already configured in the code

### Debug Commands:
```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs

# Remove deployment
vercel remove
```

## 📞 Support
- Vercel Documentation: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions 