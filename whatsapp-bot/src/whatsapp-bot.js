const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class WhatsAppBot {
    constructor() {
        this.browser = null;
        this.page = null;
        this.isConnected = false;
        this.sessionPath = process.env.WHATSAPP_SESSION_PATH || './sessions';
        this.userDataDir = path.join(this.sessionPath, 'user-data');
        
        // Ensure session directory exists
        if (!fs.existsSync(this.sessionPath)) {
            fs.mkdirSync(this.sessionPath, { recursive: true });
        }
    }

    async init() {
        try {
            console.log('🚀 Initializing WhatsApp Bot...');
            
            // Launch browser with security settings
            this.browser = await puppeteer.launch({
                headless: false, // Set to true in production
                userDataDir: this.userDataDir,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding'
                ]
            });

            this.page = await this.browser.newPage();
            
            // Set security headers
            await this.page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9'
            });

            // Navigate to WhatsApp Web
            await this.page.goto('https://web.whatsapp.com/', {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            console.log('📱 WhatsApp Web loaded. Please scan QR code if needed.');
            
            // Wait for connection
            await this.waitForConnection();
            
        } catch (error) {
            console.error('Failed to initialize WhatsApp Bot:', error);
            throw error;
        }
    }

    async waitForConnection() {
        try {
            // Wait for WhatsApp to be ready
            await this.page.waitForSelector('[data-testid="chat-list"]', {
                timeout: 300000 // 5 minutes
            });
            
            this.isConnected = true;
            console.log('✅ WhatsApp connected successfully!');
            
            // Set up message listener
            this.setupMessageListener();
            
        } catch (error) {
            console.error('Failed to connect to WhatsApp:', error);
            throw error;
        }
    }

    setupMessageListener() {
        // Listen for new messages
        this.page.on('response', async (response) => {
            if (response.url().includes('messages')) {
                try {
                    const data = await response.json();
                    // Process incoming messages
                    this.handleIncomingMessage(data);
                } catch (error) {
                    // Ignore non-JSON responses
                }
            }
        });
    }

    async handleIncomingMessage(data) {
        // Handle incoming messages and poll responses
        console.log('📨 Received message:', data);
    }

    async sendMessage(groupId, message) {
        try {
            if (!this.isConnected) {
                throw new Error('WhatsApp not connected');
            }

            // Navigate to group
            const groupUrl = `https://web.whatsapp.com/send?phone=${groupId}&text=${encodeURIComponent(message)}`;
            await this.page.goto(groupUrl, { waitUntil: 'networkidle2' });

            // Wait for send button and click it
            await this.page.waitForSelector('[data-testid="send"]', { timeout: 10000 });
            await this.page.click('[data-testid="send"]');

            console.log(`✅ Message sent to group ${groupId}`);
            return true;

        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }

    async sendPoll(groupId, question, options) {
        try {
            if (!this.isConnected) {
                throw new Error('WhatsApp not connected');
            }

            // Create poll message
            const pollMessage = this.createPollMessage(question, options);
            
            // Navigate to group
            const groupUrl = `https://web.whatsapp.com/send?phone=${groupId}&text=${encodeURIComponent(pollMessage)}`;
            await this.page.goto(groupUrl, { waitUntil: 'networkidle2' });

            // Wait for send button and click it
            await this.page.waitForSelector('[data-testid="send"]', { timeout: 10000 });
            await this.page.click('[data-testid="send"]');

            console.log(`✅ Poll sent to group ${groupId}`);
            return true;

        } catch (error) {
            console.error('Failed to send poll:', error);
            throw error;
        }
    }

    createPollMessage(question, options) {
        let message = `📊 ${question}\n\n`;
        options.forEach((option, index) => {
            message += `${index + 1}. ${option}\n`;
        });
        message += '\nReply with your choice (1, 2, 3, etc.)';
        return message;
    }

    async getStatus() {
        return {
            connected: this.isConnected,
            timestamp: new Date().toISOString()
        };
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

module.exports = WhatsAppBot; 