# 🏆 Poker Results Tracker (CSV + API)

A secure poker results tracker that stores data in CSV files within your Git repository, updated via API endpoints.

## 🚀 Features

- **CSV Storage**: All data saved to `data/poker_results.csv` in your Git repository
- **API Endpoints**: POST to `/api/winner` to add results
- **Version Controlled**: Every result is tracked in Git commits
- **Local Server**: Run locally on your machine
- **Secure API**: Bearer token authentication for recording winners
- **Hidden Results Page**: Access results at `/reveal`
- **Statistics Dashboard**: Shows total games, split pots, and split rate
- **Git Integration**: Data automatically version controlled

## 📋 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r results_requirements.txt
```

### 2. Start the Server

```bash
python results_app.py
```

The server will start on `http://localhost:5001` and automatically create the data directory and CSV file.

### 3. Add Results via API

```bash
curl -X POST http://localhost:5001/api/winner \
  -H "Authorization: Bearer toasty1" \
  -H "Content-Type: application/json" \
  -d '{"winners": ["Alex", "Maya"], "split": true, "notes": "50/50 split"}'
```

### 4. View Results

Visit: `http://localhost:5001/reveal`

## 🔧 API Usage

### Record a Winner

**POST** `http://localhost:5001/api/winner`

**Headers:**
```
Authorization: Bearer toasty1
Content-Type: application/json
```

**Body:**
```json
{
  "winners": ["Alex", "Maya"],
  "split": true,
  "notes": "50/50 split pot",
  "other_players": "John, Sarah, Mike"
}
```

**Response:**
```json
{
  "status": "ok",
  "message": "Winner recorded successfully"
}
```

### Get Results (JSON)

**GET** `http://localhost:5001/api/results`

**Response:**
```json
{
  "results": [
    {
      "date": "2025-01-22",
      "winners": "Alex, Maya",
      "split": true,
      "notes": "50/50 split pot",
      "other_players": "John, Sarah, Mike"
    }
  ]
}
```

### Download CSV

**GET** `http://localhost:5001/download-csv`

Downloads the complete `poker_results.csv` file.

## 📱 Mobile Setup (HTTP Request Shortcuts)

### 1. Install HTTP Request Shortcuts
Download from Google Play Store

### 2. Create New Shortcut
- **Method**: POST
- **URL**: `http://YOUR_LOCAL_IP:5001/api/winner`
- **Headers**:
  ```
  Authorization: Bearer toasty1
  Content-Type: application/json
  ```
- **Body** (JSON):
  ```json
  {
    "winners": ["Winner Name"],
    "split": false,
    "notes": "",
    "other_players": "Player1, Player2, Player3"
  }
  ```

### 3. Find Your Local IP
```bash
# On Windows
ipconfig

# On Mac/Linux
ifconfig
```

Look for your local IP (usually starts with 192.168.x.x or 10.0.x.x)

## 🔍 Viewing Results

### Local Results Page
Visit: `http://localhost:5001/reveal`

Features:
- 📊 Statistics dashboard
- 📅 Reverse chronological order
- 🎨 Split pots highlighted
- 📱 Mobile responsive
- 📥 Download JSON/CSV buttons
- 💾 Git version control info

## 📁 File Structure

```
backend/
├── results_app.py          # Main Flask application
├── results_requirements.txt # Python dependencies
├── test_results_api.py     # API testing script
├── start-results.bat       # Windows start script
├── data/                   # Data directory (auto-created)
│   └── poker_results.csv  # Results storage
└── RESULTS_README.md      # This file
```

## 🧪 Testing

```bash
# Run test script
python test_results_api.py

# Or test manually
curl -X POST http://localhost:5001/api/winner \
  -H "Authorization: Bearer toasty1" \
  -H "Content-Type: application/json" \
  -d '{"winners": ["Test"], "split": false, "notes": "Test game", "other_players": "Player1, Player2"}'
```

## 🔒 Security

- **Local Only**: Server runs on your local machine
- **Simple Token**: Uses "SECRET123" for basic authentication
- **No External Access**: Data stays in your Git repository
- **Version Control**: All changes tracked in Git commits

## 📊 CSV Format

The `data/poker_results.csv` file stores data in this format:

```csv
date,winners,split,notes,other_players
2025-01-22,"Alex, Maya",true,"50/50 split","John, Sarah, Mike"
2025-01-21,"John",false,"Big pot","Alex, Maya, Lisa"
2025-01-20,"Lisa, Mike, Sarah",true,"3-way split","Alex, John"
```

## 🎯 Usage Workflow

1. **Start Server**: Run `python results_app.py`
2. **Game Ends**: Use HTTP Request Shortcuts to record winner(s)
3. **Quick Entry**: Tap shortcut, enter names, submit
4. **View Results**: Visit `http://localhost:5001/reveal`
5. **Commit Data**: Git commit the updated CSV file
6. **Track Progress**: Monitor statistics and trends

## 🔧 Git Integration

### Automatic Data Tracking
Every time you record a winner, the CSV file is updated. Commit these changes to track your poker history:

```bash
# After recording some results
git add data/poker_results.csv
git commit -m "Add poker results: Alex and Maya split pot"
git push
```

### Backup Strategy
- CSV file is automatically backed up with every Git commit
- Data is version controlled and can be restored from any point
- No external database or cloud storage needed

## 🚀 Deployment Options

### Local Development
- **Pros**: Simple, no external dependencies, full control
- **Setup**: Just run `python results_app.py`
- **URL**: `http://localhost:5001`

### Local Network Server
- **Pros**: Accessible from other devices on your network
- **Setup**: Run server and access via your local IP
- **URL**: `http://YOUR_LOCAL_IP:5001`

### Simple Web Server
If you want to host it on a basic web server:
- **Pros**: Accessible from anywhere
- **Setup**: Upload files to any web server with Python support
- **URL**: `http://your-domain.com:5001`

## 🔧 Customization

### Change Token
Edit the `AUTH_TOKEN` variable in `results_app.py`:

```python
AUTH_TOKEN = 'your_custom_token'
```

### Change Data Location
Edit the `RESULTS_FILE` variable:

```python
RESULTS_FILE = 'your/custom/path/results.csv'
```

### Add Fields
Modify the CSV structure and update the API accordingly.

## 🆘 Troubleshooting

### Server Won't Start
- Check if port 5001 is available
- Try a different port in `results_app.py`
- Ensure Python and Flask are installed

### API Returns 403
- Check your `Authorization` header
- Verify the token is "toasty1"

### Results Not Showing
- Check if `data/poker_results.csv` exists
- Verify file permissions
- Check server logs

### Mobile Can't Connect
- Ensure phone and computer are on same network
- Check firewall settings
- Use your computer's local IP address

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Test with the provided test script
4. Verify the CSV file exists and is readable

## 🎯 Benefits of CSV + API Approach

- ✅ **CSV Storage**: Data stored in readable CSV files
- ✅ **Version Control**: Track all changes over time
- ✅ **API Access**: Programmatic access to add results
- ✅ **Backup**: Automatic backup with every commit
- ✅ **Privacy**: Data stays on your machine
- ✅ **Simple**: No complex database setup
- ✅ **Portable**: Can run anywhere with Python

---

**Happy Poker Tracking! 🃏** 