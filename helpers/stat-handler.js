const {promises: {readFile, writeFile}} = require("fs");
const statFile = "./stats-and-cache/angry-stats.json";
const channelCacheFile = "./stats-and-cache/last-channel-updates.json";
const GoogleSheetHandler = require("./google-sheets-handler.js");

class AngryStatHandler {
    // Stat constants
    BOT_ANGRY_REACTIONS = "angry-reactions-by-bot";
    TAROTS_READ = "angry-tarots-read";
    TOTAL_ANGRY_EMOJIS_SENT = "angry-emois-sent-total";
    USER_ANGRY_EMOJIS_SENT = "emojis-sent";
    USER_TAROTS_READ = "tarots-requested";
    DIVOTKEY_REACTIONS = "angry-divotkey";
    TIMES_CENCORED = "messages-cencored";

    stats = {}
    lastDBUpdate = 0;
    lastCachedMessages = {};

    /**
     * Read statFile if present and load old stats, otherwise prepeare a new stat variable
     */
    constructor() {
        readFile(statFile).then(fileBuffer => {
            this.stats = JSON.parse(fileBuffer.toString());
        }).catch(error => {
            console.error("Error reading stat File: " + error.message);
        }).finally(() => {
            if(!this.stats.tarots) {
                this.stats.tarots = {};
            }
            if(!this.stats.users){
                this.stats.users = {};
            }
            if(!this.stats.emojis){
                this.stats.emojis = {};
            }
        });

        readFile(channelCacheFile).then(fileBuffer => {
            this.lastCachedMessages = JSON.parse(fileBuffer.toString());
        }).catch(error => {
            console.error("Error reading cache File: " + error.message);
        });

        setTimeout(this.saveStatsToGoogleSheet, (new Date().setHours(24, 0, 0, 0) - Date.now()));
    }

    incrementCencoredStat(userId, userName, amount = 1) {
        if(!this.stats.users[userId]) {
            this.stats.users[userId] = {
                "name": userName
            };
        }
        
        this.incrementStat(this.TIMES_CENCORED, amount);
        this.incrementUserStat(userId, this.TIMES_CENCORED, amount);
    }

    /**
     * Increments a stat in cache and FS
     * @param {String} key Key of the stat to update
     * @param {Number} value Increment stat by this amount, default = 1
     */
    incrementStat(key, value = 1) {
        if(this.stats[key]) {
            this.stats[key] += value;
        } else {
            this.stats[key] = value;
        }

        this.writeStatsToFs();
    }

    /**
     * Reads a stat and returns it
     * @param {Number} key Key of the stat to return
     * @returns A number representing a given stat
     */
    getStat(key) {
        if(this.stats[key]) {
            return this.stats[key];
        }
    }

    /**
     * Increments the counter for one individual tarot and sum of all tarots
     * @param {Number} tarot The tarot that was read and needs to be incremented
     */
    incrementTarotStat(userId, userName, tarot) {
        if(this.stats.tarots[tarot]) {
            this.stats.tarots[tarot] += 1;
        } else {
            this.stats.tarots[tarot] = 1;
        }

        if(!this.stats.users[userId]){
            this.stats.users[userId] = {
                "name": userName
            };
        }

        this.incrementStat(this.TAROTS_READ);
        this.incrementUserStat(userId, this.USER_TAROTS_READ);
    }

    /**
     * This function returns the number of times a given tarot was read
     * @param {Number} tarot Tarot number
     * @returns The number of times the given tarot was read
     */
    getTarotStat(tarot) {
        if(this.stats.tarots[tarot]) {
            return this.stats.tarots[tarot];
        } else {
            return 0;
        }
    }

    /**
     * Sets a stat for a given user.
     * @param {Number} userId Discord user ID
     * @param {String} userName Discord username
     * @param {String} key Stat key (see class constants)
     * @param {*} value Value of the stat
     */
    setUserStat(userId, userName, key, value) {
        if(!this.stats.users[userId]) {
            this.stats.users[userId] = {
                "name": userName,
            };
        }
        
        this.stats.users[userId][key] = value;
    }
    
    /**
     * Increments one stat entry for one user
     * @param {Number} userId Discord user ID
     * @param {String} key Stat key (see class constants)
     * @param {Number} value Amount that the stat should be incremented
     */
    incrementUserStat(userId, key, value = 1) {
        if(this.stats.users[userId][key]) {
            this.stats.users[userId][key] += value;
        } else {
            this.stats.users[userId][key] = value;
        }
    }

    /**
     * Increments the emoji usage stat for a given user
     * @param {Number} userId Discord user Id
     * @param {Number} emoji ID of the angry-emoji
     * @param {Number} amount Amount by which the stat is increased
     */
    incrementUserEmoji(userId, emoji, amount = 1) {
        if(!this.stats.users[userId].emojis) 
            this.stats.users[userId].emojis = {};
        if(this.stats.users[userId].emojis[emoji]) {
            this.stats.users[userId].emojis[emoji] += amount;
        } else {
            this.stats.users[userId].emojis[emoji] = amount;
        }
        this.incrementUserStat(userId, this.USER_ANGRY_EMOJIS_SENT, amount);
    }

    /**
     * Returns all stats saved for a given user
     * @param {Number} userId Discord user ID
     * @returns All stats for the given user
     */
    getUserStats(userId) {
        if(this.stats.users[userId]) {
            return this.stats.users[userId];
        }
    }

    /**
     * Get all saved stats for all users
     * @returns All stats for all users
     */
    getAllUserStats() {
        return this.stats.users;
    }

    /**
     * Returns how often every emoji has been used, if a user ID is provided then
     * only the emoji usage for this one user is returned.
     * @param {Number} userId Discord user ID (optional)
     * @returns How often all emojis have been used
     */
    getEmojiStats(userId = null) {
        if(userId && this.stats.users[userId]) {
            return this.stats.users[userId].emojis;
        } else {
            return this.stats.emojis;
        }
    }

    /**
     * Increments the total number a given angry-emoji has been used
     * @param {Number} emoji Angry-Emoji ID
     * @param {Number} amount Amount by which the stat should be incremented (default 1)
     */
    incrementEmojiStat(emoji, amount = 1) {
        if(this.stats.emojis[emoji]) {
            this.stats.emojis[emoji] += amount;
        } else {
            this.stats.emojis[emoji] = amount;
        }
    }

    /**
     * Takes in an Array of Discord messages and searches through all of them for angry-emojis.
     * Updates the emoji-usage stats accordingly
     * @param {Array<Meaasge>} newMessages An array of Discord messages
     */
    updateTotals(newMessages) {     
        newMessages.forEach(message => {
            if(!this.stats.users[message.author.id])
                this.stats.users[message.author.id]= {};
            this.stats.users[message.author.id].name = message.author.username;
            
            const regex = new RegExp("<:angry([0-9]{1,3}):[0-9]+>", "g");
            const matches = Array.from(message.cleanContent.matchAll(regex), m => m[1]);

            matches.forEach(emoji => {
                this.incrementUserEmoji(message.author.id, emoji);
                this.incrementEmojiStat(emoji);
            });
        });
    }

    /**
     * Remembers the last message that has already been included in the stats
     * @param {Number} channelId Discord channel ID
     * @param {Number} messageId Discord message ID
     */
    setLastMessageId(channelId, messageId) {
        this.lastCachedMessages[channelId] = messageId;
        writeFile(channelCacheFile, JSON.stringify(this.lastCachedMessages)).catch(err => {
            console.error(err);
        });
    }

    /**
     * Returns the ID of the last message already included in the stats for a given channel
     * @param {Number} channelId Discord channel ID
     * @returns The ID of the last message already included in the stats
     */
    getLastMessageId(channelId) {
        if(!this.lastCachedMessages[channelId]) {
            return null;
        } else {
            return this.lastCachedMessages[channelId];
        }
    }

    /**
     * Writes all currently saved stats to a file
     */
    writeStatsToFs() {
        writeFile(statFile, JSON.stringify(this.stats)).catch((err) => {
            console.error("Writing stats failed: " + JSON.stringify(err));
        });
    }

    /**
     * Write the statFile to the Google Stat Sheet
     * This method is called every day at 23:55
     * Do not call this method if not needed
     */
    saveStatsToGoogleSheet() {
        const data = [];
        const today = new Date();
        data.push(today.toLocaleDateString("de-AT"));
        data.push(this.stats[this.BOT_ANGRY_REACTIONS]);
        data.push(this.stats[this.TAROTS_READ]);
        data.push(this.stats[this.DIVOTKEY_REACTIONS]);
        data.push(this.stats[this.TIMES_CENCORED]);
    
        GoogleSheetHandler.saveToSheet(data);
    
        const timeUntilMidnight = (new Date().setHours(24, 0, 0, 0) - Date.now());
        setTimeout(this.saveStatsToGoogleSheet, timeUntilMidnight);
    }
}

module.exports = AngryStatHandler;