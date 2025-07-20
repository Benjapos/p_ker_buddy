# 🃏 P_Ker Buddy - Texas No-Limit Hold'em

An AI-powered poker decision-making tool specifically designed for Texas No-Limit Hold'em, the world's most popular poker variant. Get professional-level advice on when to fold, call, or raise based on your cards, position, and game situation.

## Features

- **Texas Hold'em Specific**: Optimized for No-Limit Hold'em rules and strategies
- **Card Selection**: Interactive card selector for hole cards and community cards
- **Game Parameters**: Configure number of players, position (UTG, MP, CO, BTN, SB, BB), pot size, and bet size
- **AI Analysis**: Get intelligent recommendations (fold, call, raise) with confidence levels
- **Hand Evaluation**: Automatic Texas Hold'em hand strength calculation
- **Pot Odds**: Real-time pot odds calculation for optimal decision making
- **Expected Value**: EV calculations for each action
- **Position-Based Strategy**: AI considers your position at the table
- **Detailed AI Reasoning**: Understand why the AI recommends each action
- **Responsive Design**: Works on desktop and mobile devices

## Texas Hold'em Specific Features

### Hand Rankings
- High Card, Pair, Two Pair, Three of a Kind
- Straight, Flush, Full House, Four of a Kind
- Straight Flush, Royal Flush

### Position Awareness
- **Early Position**: UTG, UTG+1 (weakest positions)
- **Middle Position**: MP, MP+1 (neutral positions)
- **Late Position**: CO, HJ (strong positions)
- **Button**: BTN (best position)
- **Blinds**: SB, BB (defending positions)

### Betting Rounds
- **Pre-flop**: Before community cards
- **Flop**: First 3 community cards
- **Turn**: 4th community card
- **River**: 5th community card

### Game Types
- **Heads-up**: 2 players
- **6-max**: 6 players (most common online)
- **Full ring**: 9-10 players (live poker standard)

## Tech Stack

### Frontend
- React 18
- Styled Components
- Axios for API calls

### Backend
- Python Flask
- CORS support
- RESTful API

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8 or higher
- npm or yarn

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd p-ker-buddy
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. **Start the Backend Server**
   ```bash
   cd backend
   python app.py
   ```
   The backend will run on `http://localhost:5000`

5. **Start the Frontend Development Server**
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

6. **Open your browser**
   Navigate to `http://localhost:3000` to use the application

## How to Use

1. **Select Your Hole Cards**: Click on the suit buttons to add your two hole cards
2. **Add Community Cards**: Select flop, turn, and river cards as they're dealt
3. **Configure Game Settings**: Set number of players, your position, pot size, and current bet
4. **Get Recommendation**: Click "Get Recommendation" to receive Texas Hold'em specific advice
5. **Review Analysis**: See the recommended action, confidence level, and reasoning

## Texas Hold'em Strategy Examples

### Pre-Flop Scenarios
- **Pocket Aces (AA)**: Premium hand, raise from any position
- **AK Suited**: Strong drawing hand, raise from late position
- **Small Pocket Pairs**: Set mining hands, call from late position
- **Suited Connectors**: Drawing hands, play from late position

### Post-Flop Scenarios
- **Top Pair**: Strong hand, bet for value
- **Flush Draw**: Drawing hand, consider pot odds
- **Open-Ended Straight Draw**: Drawing hand, calculate odds
- **Set**: Very strong hand, bet aggressively

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) - Recommended

#### Frontend Deployment (Vercel)
1. **Create Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Connect Repository**: Connect your GitHub repository to Vercel
3. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`
4. **Set Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```
5. **Deploy**: Vercel will automatically deploy your app

#### Backend Deployment (Railway)
1. **Create Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Connect Repository**: Connect your GitHub repository
3. **Configure Service**:
   - Set the source directory to `backend`
   - Add environment variables if needed
4. **Deploy**: Railway will automatically deploy your API

### Option 2: Netlify (Frontend) + Heroku (Backend)

#### Frontend Deployment (Netlify)
1. **Create Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **Connect Repository**: Connect your GitHub repository
3. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Publish Directory: `build`
4. **Set Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-heroku-app.herokuapp.com
   ```

#### Backend Deployment (Heroku)
1. **Create Heroku Account**: Sign up at [heroku.com](https://heroku.com)
2. **Install Heroku CLI**: Follow instructions at [devcenter.heroku.com](https://devcenter.heroku.com/articles/heroku-cli)
3. **Create Heroku App**:
   ```bash
   heroku create your-poker-ai-app
   ```
4. **Set Buildpack**:
   ```bash
   heroku buildpacks:set heroku/python
   ```
5. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option 3: AWS (Full Stack)

#### Using AWS Amplify
1. **Install AWS Amplify CLI**:
   ```bash
   npm install -g @aws-amplify/cli
   ```
2. **Initialize Amplify**:
   ```bash
   amplify init
   ```
3. **Add API**:
   ```bash
   amplify add api
   ```
4. **Deploy**:
   ```bash
   amplify push
   amplify publish
   ```

#### Using AWS EC2
1. **Launch EC2 Instance**: Use Ubuntu or Amazon Linux
2. **Install Dependencies**:
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip nodejs npm nginx
   ```
3. **Deploy Backend**:
   ```bash
   cd backend
   pip3 install -r requirements.txt
   sudo systemctl enable gunicorn
   ```
4. **Deploy Frontend**:
   ```bash
   npm install
   npm run build
   ```
5. **Configure Nginx**: Set up reverse proxy for both frontend and backend

### Option 4: DigitalOcean App Platform

1. **Create DigitalOcean Account**: Sign up at [digitalocean.com](https://digitalocean.com)
2. **Create App**: Use the App Platform
3. **Add Frontend Component**:
   - Source: Your GitHub repository
   - Build Command: `npm run build`
   - Output Directory: `build`
4. **Add Backend Component**:
   - Source: Your GitHub repository
   - Source Directory: `backend`
   - Run Command: `gunicorn app:app`

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

### Backend (.env)
```
FLASK_ENV=production
PORT=5000
```

## Production Considerations

### Security
- Add rate limiting to API endpoints
- Implement user authentication
- Use HTTPS in production
- Add input validation and sanitization

### Performance
- Add caching for hand evaluations
- Implement database for storing hand histories
- Use CDN for static assets
- Add monitoring and logging

### AI Enhancement
- Integrate with OpenAI GPT for more sophisticated reasoning
- Use machine learning models trained on Texas Hold'em data
- Add Monte Carlo simulation for odds calculation
- Implement game theory optimal (GTO) strategies for Texas Hold'em

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@example.com or create an issue in the GitHub repository.

## Roadmap

- [x] User accounts and hand history
- [x] Tournament mode support
- [x] Advanced Texas Hold'em AI with machine learning
- [ ] Mobile app (React Native)
- [ ] Real-time multiplayer support
- [x] Hand replay and analysis
- [ ] Integration with poker sites (where legal)
- [x] GTO (Game Theory Optimal) strategies
- [x] ICM (Independent Chip Model) for tournaments 