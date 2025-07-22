from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import csv
import os
from datetime import date
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Configuration - all data stored in Git repository
RESULTS_FILE = 'data/poker_results.csv'
AUTH_TOKEN = 'toasty1'  # Simple token for basic security

# Ensure data directory and CSV file exist
def init_csv():
    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    # Create CSV file with headers if it doesn't exist
    if not os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['date', 'winners', 'split', 'notes', 'other_players'])

init_csv()

@app.route('/api/winner', methods=['POST'])
def add_winner():
    auth_header = request.headers.get('Authorization', '')
    if auth_header != f'Bearer {AUTH_TOKEN}':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    if not data or 'winners' not in data:
        return jsonify({'error': 'Invalid data'}), 400

    winners = [w.strip() for w in data['winners']]
    split = data.get('split', False)
    notes = data.get('notes', '')
    other_players = data.get('other_players', '')

    # Append to CSV file
    with open(RESULTS_FILE, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([str(date.today()), ', '.join(winners), str(split).lower(), notes, other_players])

    return jsonify({'status': 'ok', 'message': 'Winner recorded successfully'}), 200

@app.route('/api/results', methods=['GET'])
def get_results():
    rows = []
    if os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE, newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader, None)  # Skip header
            rows = list(reader)

    # Convert to list of dicts and reverse for most recent first
    results = []
    for row in reversed(rows):
        if len(row) >= 5:
            results.append({
                'date': row[0],
                'winners': row[1],
                'split': row[2] == 'true',
                'notes': row[3],
                'other_players': row[4]
            })
        elif len(row) >= 4:  # Handle old format without other_players
            results.append({
                'date': row[0],
                'winners': row[1],
                'split': row[2] == 'true',
                'notes': row[3],
                'other_players': ''
            })

    return jsonify({'results': results})

@app.route('/reveal')
def reveal_results():
    rows = []
    if os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE, newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader, None)  # Skip header
            rows = list(reader)

    rows.reverse()  # Show most recent first

    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Poker Results</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                min-height: 100vh;
                color: #333;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            h1 {
                color: #1e3c72;
                text-align: center;
                margin-bottom: 30px;
                font-size: 2.5em;
                font-weight: 700;
            }
            .info-box {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 30px;
                text-align: center;
            }
            .info-box h3 {
                color: #1e3c72;
                margin-top: 0;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            th, td {
                padding: 15px;
                text-align: left;
                border-bottom: 1px solid #eee;
            }
            th {
                background: linear-gradient(45deg, #1e3c72, #2a5298);
                color: white;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 0.9em;
                letter-spacing: 0.5px;
            }
            tr:hover {
                background-color: #f8f9fa;
            }
            .split-yes {
                background-color: #fff6cc;
                border-left: 4px solid #ffaa00;
            }
            .split-yes:hover {
                background-color: #fff2b3;
            }
            .winners {
                font-weight: 600;
                color: #1e3c72;
            }
            .date {
                color: #666;
                font-size: 0.9em;
            }
            .notes {
                font-style: italic;
                color: #888;
            }
            .other-players {
                color: #666;
                font-size: 0.9em;
            }
            .no-results {
                text-align: center;
                padding: 50px;
                color: #666;
                font-size: 1.2em;
            }
            .stats {
                display: flex;
                justify-content: space-around;
                margin-bottom: 30px;
                flex-wrap: wrap;
                gap: 20px;
            }
            .stat-card {
                background: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                min-width: 150px;
            }
            .stat-number {
                font-size: 2em;
                font-weight: 700;
                color: #1e3c72;
            }
            .stat-label {
                color: #666;
                font-size: 0.9em;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .download-btn {
                background: linear-gradient(45deg, #1e3c72, #2a5298);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1em;
                margin: 10px;
                text-decoration: none;
                display: inline-block;
            }
            .download-btn:hover {
                opacity: 0.9;
            }
            @media (max-width: 768px) {
                .container {
                    padding: 15px;
                    margin: 10px;
                }
                h1 {
                    font-size: 2em;
                }
                th, td {
                    padding: 10px;
                    font-size: 0.9em;
                }
                .stats {
                    flex-direction: column;
                    align-items: center;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏆 Poker Game Results</h1>
            
            <div class="info-box">
                <h3>📊 Git-Based CSV Storage</h3>
                <p>All results are stored in <code>data/poker_results.csv</code> in your Git repository.</p>
                <p>Data is automatically saved and version controlled with your commits.</p>
                <a href="/api/results" class="download-btn" target="_blank">📥 Download JSON</a>
                <a href="/download-csv" class="download-btn">📄 Download CSV</a>
            </div>
            
            {% if rows %}
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">{{ rows|length }}</div>
                    <div class="stat-label">Total Games</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{{ rows|selectattr('2', 'equalto', 'true')|list|length }}</div>
                    <div class="stat-label">Split Pots</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{{ (rows|selectattr('2', 'equalto', 'true')|list|length * 100 / rows|length)|round(1) if rows|length > 0 else 0 }}%</div>
                    <div class="stat-label">Split Rate</div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Winners</th>
                        <th>Split</th>
                        <th>Notes</th>
                        <th>Other Players</th>
                    </tr>
                </thead>
                <tbody>
                    {% for row in rows %}
                    <tr class="{{ 'split-yes' if row[2] == 'true' else '' }}">
                        <td class="date">{{ row[0] }}</td>
                        <td class="winners">{{ row[1] }}</td>
                        <td>{{ 'Yes' if row[2] == 'true' else 'No' }}</td>
                        <td class="notes">{{ row[3] }}</td>
                        <td class="other-players">{{ row[4] if row|length > 4 else '' }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
            {% else %}
            <div class="no-results">
                <h3>📊 No results recorded yet</h3>
                <p>Start tracking your poker games to see results here!</p>
                <p>Use the API endpoint to add results: <code>POST /api/winner</code></p>
            </div>
            {% endif %}
        </div>
    </body>
    </html>
    """
    return render_template_string(html_template, rows=rows)

@app.route('/download-csv')
def download_csv():
    if os.path.exists(RESULTS_FILE):
        from flask import send_file
        return send_file(RESULTS_FILE, as_attachment=True, download_name='poker_results.csv')
    else:
        return jsonify({'error': 'No results file found'}), 404

if __name__ == '__main__':
    print("🏆 Poker Results Tracker Started!")
    print(f"📊 Data stored in: {RESULTS_FILE}")
    print(f"🔍 View results at: http://localhost:5001/reveal")
    print(f"🔑 API token: {AUTH_TOKEN}")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5001) 