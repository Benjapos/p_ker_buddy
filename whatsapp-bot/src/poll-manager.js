const Joi = require('joi');

class PollManager {
    constructor(whatsappBot, database) {
        this.whatsappBot = whatsappBot;
        this.db = database;
        this.activePolls = new Map();
        
        // Poll templates
        this.pollTemplates = {
            availability: {
                question: "🎲 Who can play poker this week?",
                options: [
                    "Sunday",
                    "Monday", 
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Can't make it"
                ]
            },
            food: {
                question: "🍕 What are you bringing?",
                options: [
                    "Beer",
                    "BBC (Big Bag of Crisps)",
                    "Crisps",
                    "Chocolate",
                    "Other snacks",
                    "Nothing this time"
                ]
            },
            host: {
                question: "🏠 Who is hosting?",
                options: [
                    "I can host",
                    "I can't host",
                    "Need to check"
                ]
            }
        };
    }

    // Validation schemas
    get pollSchema() {
        return Joi.object({
            question: Joi.string().max(500).required(),
            options: Joi.array().items(Joi.string().max(100)).min(2).max(10).required(),
            groupId: Joi.string().pattern(/^\d+@g\.us$/).required(),
            type: Joi.string().valid('availability', 'food', 'host', 'custom').required()
        });
    }

    async createPoll(question, options, groupId, type) {
        try {
            // Validate input
            const { error } = this.pollSchema.validate({ question, options, groupId, type });
            if (error) {
                throw new Error(`Validation error: ${error.details[0].message}`);
            }

            // Create poll in database
            const pollId = await this.db.createPoll({
                question,
                options,
                groupId,
                type,
                createdAt: new Date().toISOString(),
                status: 'active'
            });

            // Send poll to WhatsApp group
            await this.whatsappBot.sendPoll(groupId, question, options);

            // Store active poll
            this.activePolls.set(pollId, {
                id: pollId,
                question,
                options,
                groupId,
                type,
                responses: new Map(),
                createdAt: new Date()
            });

            console.log(`✅ Poll created: ${type} poll sent to group ${groupId}`);
            return { pollId, question, options, type };

        } catch (error) {
            console.error('Failed to create poll:', error);
            throw error;
        }
    }

    async sendAvailabilityPoll() {
        try {
            const template = this.pollTemplates.availability;
            const groupId = process.env.WHATSAPP_GROUP_ID;
            
            if (!groupId) {
                throw new Error('WhatsApp group ID not configured');
            }

            await this.createPoll(
                template.question,
                template.options,
                groupId,
                'availability'
            );

        } catch (error) {
            console.error('Failed to send availability poll:', error);
            throw error;
        }
    }

    async sendFoodPoll() {
        try {
            const template = this.pollTemplates.food;
            const groupId = process.env.WHATSAPP_GROUP_ID;
            
            if (!groupId) {
                throw new Error('WhatsApp group ID not configured');
            }

            await this.createPoll(
                template.question,
                template.options,
                groupId,
                'food'
            );

        } catch (error) {
            console.error('Failed to send food poll:', error);
            throw error;
        }
    }

    async sendHostPoll() {
        try {
            const template = this.pollTemplates.host;
            const groupId = process.env.WHATSAPP_GROUP_ID;
            
            if (!groupId) {
                throw new Error('WhatsApp group ID not configured');
            }

            await this.createPoll(
                template.question,
                template.options,
                groupId,
                'host'
            );

        } catch (error) {
            console.error('Failed to send host poll:', error);
            throw error;
        }
    }

    async processPollResponse(pollId, phoneNumber, response) {
        try {
            // Validate response
            if (!pollId || !phoneNumber || !response) {
                throw new Error('Invalid poll response data');
            }

            // Get poll data
            const poll = this.activePolls.get(pollId);
            if (!poll) {
                throw new Error('Poll not found or expired');
            }

            // Validate response option
            const optionIndex = parseInt(response) - 1;
            if (isNaN(optionIndex) || optionIndex < 0 || optionIndex >= poll.options.length) {
                throw new Error('Invalid response option');
            }

            // Store response in database
            await this.db.addPollResponse(pollId, phoneNumber, optionIndex, poll.options[optionIndex]);

            // Update active poll
            poll.responses.set(phoneNumber, {
                option: optionIndex,
                text: poll.options[optionIndex],
                timestamp: new Date()
            });

            console.log(`✅ Poll response recorded: ${phoneNumber} chose ${poll.options[optionIndex]}`);
            return true;

        } catch (error) {
            console.error('Failed to process poll response:', error);
            throw error;
        }
    }

    async getPollResults(pollId) {
        try {
            // Get results from database
            const results = await this.db.getPollResults(pollId);
            
            // Get poll details
            const poll = this.activePolls.get(pollId);
            if (!poll) {
                throw new Error('Poll not found');
            }

            // Format results
            const formattedResults = {
                pollId,
                question: poll.question,
                options: poll.options,
                type: poll.type,
                totalResponses: results.length,
                responses: results,
                optionCounts: this.countResponses(results, poll.options.length)
            };

            return formattedResults;

        } catch (error) {
            console.error('Failed to get poll results:', error);
            throw error;
        }
    }

    countResponses(responses, optionCount) {
        const counts = new Array(optionCount).fill(0);
        responses.forEach(response => {
            if (response.option >= 0 && response.option < optionCount) {
                counts[response.option]++;
            }
        });
        return counts;
    }

    async closePoll(pollId) {
        try {
            // Update poll status in database
            await this.db.updatePollStatus(pollId, 'closed');

            // Remove from active polls
            this.activePolls.delete(pollId);

            console.log(`✅ Poll ${pollId} closed`);
            return true;

        } catch (error) {
            console.error('Failed to close poll:', error);
            throw error;
        }
    }

    async getActivePolls() {
        return Array.from(this.activePolls.values());
    }
}

module.exports = PollManager; 