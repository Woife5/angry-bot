const {promises: {readFile, writeFile}} = require("fs");
const statFile = "./stats-and-cache/angry-stats.json";
const channelCacheFile = "./stats-and-cache/last-channel-updates.json";

class AngryStatHandler {
    // Stat constants
    BOT_ANGRY_REACTIONS = "angry-reactions-by-bot";
    TAROTS_READ = "angry-tarots-read";
    TOTAL_ANGRY_EMOJIS_SENT = "angry-emois-sent-total";
    USER_ANGRY_EMOJIS_SENT = "emojis-sent";
    USER_TAROTS_READ = "tarots-requested";

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
    incrementTarotStat(userId, tarot) {
        if(this.stats.tarots[tarot]) {
            this.stats.tarots[tarot] += 1;
        } else {
            this.stats.tarots[tarot] = 1;
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

    setUserStat(userId, userName, key, value) {
        if(!this.stats.users[userId]) {
            this.stats.users[userId] = {
                "name": userName,
            };
        }
        
        this.stats.users[userId][key] = value;
    }
    
    incrementUserStat(userId, key, value = 1) {
        if(this.stats.users[userId][key]) {
            this.stats.users[userId][key] += value;
        } else {
            this.stats.users[userId][key] = value;
        }
    }

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

    getUserStats(userId) {
        if(this.stats.users[userId]) {
            return this.stats.users[userId];
        }
    }

    getAllUserStats() {
        return this.stats.users;
    }

    getEmojiStats(userId = null) {
        if(userId && this.stats.users[userId]) {
            return this.stats.users[userId].emojis;
        } else {
            return this.stats.emojis;
        }
    }

    incrementEmojiStat(emoji, amount = 1) {
        if(this.stats.emojis[emoji]) {
            this.stats.emojis[emoji] += amount;
        } else {
            this.stats.emojis[emoji] = amount;
        }
    }

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

    setLastMessageId(channelId, messageId) {
        this.lastCachedMessages[channelId] = messageId;
        writeFile(channelCacheFile, JSON.stringify(this.lastCachedMessages)).catch(err => {
            console.error(err);
        });
    }

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
     * Write the statFile to the database
     * DOES NOT DO ANYTHING RIGHT NOW, W.I.P.
     */
    writeStatsToDB() {
        // TODO write all current stats to the mongodb database? maybe sometime
        this.lastDBUpdate = Date.now();
    }
}

module.exports = AngryStatHandler;