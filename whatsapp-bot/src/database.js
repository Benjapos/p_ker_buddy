const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
    constructor() {
        this.dbPath = process.env.DATABASE_PATH || './data/poker_bot.db';
        this.db = null;
        
        // Ensure data directory exists
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Failed to connect to database:', err);
                    reject(err);
                } else {
                    console.log('✅ Database connected');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    async createTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS polls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT NOT NULL,
                options TEXT NOT NULL,
                group_id TEXT NOT NULL,
                type TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS poll_responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                poll_id INTEGER NOT NULL,
                phone_number TEXT NOT NULL,
                option_index INTEGER NOT NULL,
                option_text TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (poll_id) REFERENCES polls (id),
                UNIQUE(poll_id, phone_number)
            )`,
            
            `CREATE TABLE IF NOT EXISTS game_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                winners TEXT NOT NULL,
                split BOOLEAN DEFAULT FALSE,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone_number TEXT UNIQUE NOT NULL,
                name TEXT,
                is_admin BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const table of tables) {
            await this.run(table);
        }
        
        console.log('✅ Database tables created');
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Poll management
    async createPoll(pollData) {
        const sql = `
            INSERT INTO polls (question, options, group_id, type, status)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const options = JSON.stringify(pollData.options);
        const result = await this.run(sql, [
            pollData.question,
            options,
            pollData.groupId,
            pollData.type,
            pollData.status
        ]);
        
        return result.id;
    }

    async addPollResponse(pollId, phoneNumber, optionIndex, optionText) {
        const sql = `
            INSERT OR REPLACE INTO poll_responses 
            (poll_id, phone_number, option_index, option_text)
            VALUES (?, ?, ?, ?)
        `;
        
        await this.run(sql, [pollId, phoneNumber, optionIndex, optionText]);
    }

    async getPollResults(pollId) {
        const sql = `
            SELECT pr.*, p.name as player_name
            FROM poll_responses pr
            LEFT JOIN players p ON pr.phone_number = p.phone_number
            WHERE pr.poll_id = ?
            ORDER BY pr.created_at
        `;
        
        return await this.all(sql, [pollId]);
    }

    async updatePollStatus(pollId, status) {
        const sql = `
            UPDATE polls 
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        await this.run(sql, [status, pollId]);
    }

    // Game results management
    async updateGameResults(gameData) {
        try {
            // Add to database
            const sql = `
                INSERT INTO game_results (date, winners, split, notes)
                VALUES (?, ?, ?, ?)
            `;
            
            await this.run(sql, [
                gameData.date,
                gameData.winners,
                gameData.split || false,
                gameData.notes || ''
            ]);

            // Update CSV file
            await this.updateCSVFile(gameData);
            
            console.log('✅ Game results updated in database and CSV');
            
        } catch (error) {
            console.error('Failed to update game results:', error);
            throw error;
        }
    }

    async updateCSVFile(gameData) {
        try {
            const csvPath = path.join(__dirname, '../../docs/data/poker_results.csv');
            
            // Read existing CSV
            let csvContent = '';
            if (fs.existsSync(csvPath)) {
                csvContent = fs.readFileSync(csvPath, 'utf8');
            } else {
                // Create new CSV with headers
                csvContent = 'date,winners,split,notes,player1,player2,player3,player4,player5,player6,player7,player8\n';
            }

            // Parse existing data
            const lines = csvContent.trim().split('\n');
            const headers = lines[0].split(',');
            
            // Create new row
            const newRow = [
                gameData.date,
                gameData.winners,
                gameData.split ? 'TRUE' : 'FALSE',
                gameData.notes || '',
                gameData.player1 || '',
                gameData.player2 || '',
                gameData.player3 || '',
                gameData.player4 || '',
                gameData.player5 || '',
                gameData.player6 || '',
                gameData.player7 || '',
                gameData.player8 || ''
            ];

            // Add new row
            lines.push(newRow.join(','));

            // Write back to file
            fs.writeFileSync(csvPath, lines.join('\n') + '\n');
            
            console.log('✅ CSV file updated');
            
        } catch (error) {
            console.error('Failed to update CSV file:', error);
            throw error;
        }
    }

    // Player management
    async addPlayer(phoneNumber, name, isAdmin = false) {
        const sql = `
            INSERT OR REPLACE INTO players (phone_number, name, is_admin)
            VALUES (?, ?, ?)
        `;
        
        await this.run(sql, [phoneNumber, name, isAdmin]);
    }

    async getPlayer(phoneNumber) {
        const sql = 'SELECT * FROM players WHERE phone_number = ?';
        return await this.get(sql, [phoneNumber]);
    }

    async isAdmin(phoneNumber) {
        const player = await this.getPlayer(phoneNumber);
        return player && player.is_admin;
    }

    // Close database
    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = Database; 