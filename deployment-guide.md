# 🚀 Deployment Guide - Poker AI Advisor

This guide provides detailed instructions for deploying your Poker AI Advisor to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:
- A GitHub repository with your code
- Node.js and npm installed locally
- Python 3.8+ installed locally
- Git installed and configured

## Option 1: Vercel + Railway (Recommended for Beginners)

### Step 1: Deploy Backend to Railway

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Backend Service**
   - Set the source directory to `backend`
   - Railway will automatically detect it's a Python app
   - Add environment variables if needed:
     ```
     FLASK_ENV=production
     ```

4. **Deploy**
   - Railway will automatically build and deploy
   - Note the generated URL (e.g., `https://your-app.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Build Settings**
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

4. **Set Environment Variables**
   - Add environment variable:
     ```
     REACT_APP_API_URL=https://your-app.railway.app
     ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your app

### Step 3: Update Frontend API Configuration

Update your frontend to use the Railway backend URL:

```javascript
// In src/utils/pokerLogic.js, update the API call:
const response = await fetch('https://your-app.railway.app/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(handData)
});
```

## Option 2: Netlify + Heroku

### Step 1: Deploy Backend to Heroku

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   
   # Linux
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create your-poker-ai-app
   ```

4. **Set Buildpack**
   ```bash
   heroku buildpacks:set heroku/python
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

6. **Verify Deployment**
   ```bash
   heroku open
   ```

### Step 2: Deploy Frontend to Netlify

1. **Sign up for Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with your GitHub account

2. **Deploy from Git**
   - Click "New site from Git"
   - Choose your repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `build`

4. **Set Environment Variables**
   - Go to Site settings > Environment variables
   - Add: `REACT_APP_API_URL=https://your-app.herokuapp.com`

5. **Deploy**
   - Click "Deploy site"

## Option 3: AWS Amplify (Full Stack)

### Step 1: Install AWS Amplify CLI

```bash
npm install -g @aws-amplify/cli
amplify configure
```

### Step 2: Initialize Amplify

```bash
amplify init
# Follow the prompts to configure your project
```

### Step 3: Add API

```bash
amplify add api
# Choose REST API
# Configure your endpoints
```

### Step 4: Deploy

```bash
amplify push
amplify publish
```

## Option 4: DigitalOcean App Platform

### Step 1: Create DigitalOcean Account

1. Sign up at [digitalocean.com](https://digitalocean.com)
2. Add payment method

### Step 2: Create App

1. **Create New App**
   - Click "Create App"
   - Connect your GitHub repository

2. **Add Frontend Component**
   - Source: Your repository
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Environment Variables:
     ```
     REACT_APP_API_URL=https://your-backend-url
     ```

3. **Add Backend Component**
   - Source: Your repository
   - Source Directory: `backend`
   - Run Command: `gunicorn app:app`

4. **Deploy**
   - Click "Create Resources"
   - DigitalOcean will deploy both components

## Option 5: Google Cloud Platform

### Step 1: Set up Google Cloud

1. **Install Google Cloud SDK**
   ```bash
   # Download from https://cloud.google.com/sdk/docs/install
   ```

2. **Initialize Project**
   ```bash
   gcloud init
   gcloud config set project YOUR_PROJECT_ID
   ```

### Step 2: Deploy Backend (Cloud Run)

1. **Create Dockerfile for Backend**
   ```dockerfile
   FROM python:3.9-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD exec gunicorn --bind :$PORT app:app
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy poker-ai-backend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Step 3: Deploy Frontend (Firebase Hosting)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## Environment Variables Setup

### Frontend Environment Variables

Create a `.env` file in your frontend root:

```env
REACT_APP_API_URL=https://your-backend-url.com
```

### Backend Environment Variables

Create a `.env` file in your backend directory:

```env
FLASK_ENV=production
PORT=5000
DATABASE_URL=your-database-url
```

## Custom Domain Setup

### Vercel Custom Domain

1. Go to your Vercel project dashboard
2. Click "Settings" > "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Heroku Custom Domain

```bash
heroku domains:add yourdomain.com
heroku domains:add www.yourdomain.com
```

Then update your DNS records to point to the provided CNAME.

## SSL Certificate Setup

Most platforms (Vercel, Netlify, Heroku, Railway) automatically provide SSL certificates.

For custom domains:
- **Let's Encrypt**: Free SSL certificates
- **Cloudflare**: Free SSL with CDN
- **Platform SSL**: Most platforms provide automatic SSL

## Monitoring and Logs

### Vercel
- Built-in analytics and performance monitoring
- Function logs in dashboard

### Heroku
```bash
heroku logs --tail
heroku addons:create papertrail:choklad
```

### Railway
- Built-in logging and monitoring
- Real-time logs in dashboard

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend has CORS configured
   - Check API URL in frontend

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

3. **API Connection Issues**
   - Verify backend URL is correct
   - Check if backend is running
   - Test API endpoints manually

4. **Environment Variables**
   - Ensure variables are set correctly
   - Restart deployment after changing variables

### Debug Commands

```bash
# Test backend locally
cd backend
python app.py

# Test frontend locally
npm start

# Check API health
curl https://your-backend-url.com/api/health
```

## Cost Estimation

### Free Tiers
- **Vercel**: Free tier with generous limits
- **Netlify**: Free tier with 100GB bandwidth
- **Railway**: Free tier with $5 credit
- **Heroku**: Free tier discontinued, $7/month minimum

### Paid Plans
- **Vercel Pro**: $20/month
- **Netlify Pro**: $19/month
- **Railway**: Pay-as-you-use
- **Heroku**: $7/month minimum

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Implement API rate limiting
4. **Input Validation**: Validate all user inputs
5. **CORS**: Configure CORS properly

## Performance Optimization

1. **CDN**: Use CDN for static assets
2. **Caching**: Implement caching strategies
3. **Compression**: Enable gzip compression
4. **Image Optimization**: Optimize images
5. **Code Splitting**: Implement React code splitting

## Next Steps

After deployment:
1. Test all functionality
2. Set up monitoring
3. Configure custom domain
4. Set up SSL certificate
5. Implement analytics
6. Create backup strategy 