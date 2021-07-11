const {promises: {readFile, writeFile}} = require("fs");
const statFile = "./stats-and-cache/angry-stats.json";
const channelCacheFile = "./stats-and-cache/last-channel-updates.json";
const GoogleSheetHandler = require("./google-sheets-handler.js");

let statLock = false;
let stats = {};
let lastCachedMessages = {};

// Initiate stats
console.log("initiating stat handler...");
readFile(statFile).then(fileBuffer => {
    stats = JSON.parse(fileBuffer.toString());
}).catch(error => {
    console.error("Error reading stat File: " + error.message);
}).finally(() => {
    if(!stats.tarots) {
        stats.tarots = {};
    }
    if(!stats.users){
        stats.users = {};
    }
    if(!stats.emojis){
        stats.emojis = {};
    }
});

readFile(channelCacheFile).then(fileBuffer => {
    lastCachedMessages = JSON.parse(fileBuffer.toString());
}).catch(error => {
    console.error("Error reading cache File: " + error.message);
});

// Set the bot to save stats every day at midnight
setTimeout(() => {
    setInterval(saveStatsToGoogleSheet, 86400000);
    saveStatsToGoogleSheet();
}, (new Date().setHours(24, 0, 0, 0) - Date.now()));

const StatHandler = {
    // Stat constants
    BOT_ANGRY_REACTIONS: "angry-reactions-by-bot",
    TAROTS_READ: "angry-tarots-read",
    TOTAL_ANGRY_EMOJIS_SENT: "angry-emois-sent-total",
    USER_ANGRY_EMOJIS_SENT: "emojis-sent",
    USER_TAROTS_READ: "tarots-requested",
    DIVOTKEY_REACTIONS: "angry-divotkey",
    TIMES_CENCORED: "messages-cencored",
    NON_FEET_RELATED_MESSAGES_DELETED: "non-feet-messages-deleted",
    YESNO_QUESTIONS_ANSWERED: "yesno-questions-answered",
    MCLUHAN = 'mcluhan',

    /**
     * Resets the toal amount of emojis sent
     */
    removeSavedEmoji() {
        lastCachedMessages = {};
        stats.emojis = {};
        const allUsers = Object.keys(stats.users);
        for (let i = 0; i < allUsers.length; i++) {
            stats.users[allUsers[i]].emojis = {};
            stats.users[allUsers[i]]["emojis-sent"] = 0;
        }

        writeStatsToFs();
        writeFile(channelCacheFile, JSON.stringify(lastCachedMessages)).catch(err => {
            console.error(err);
        });
    },

    /**
     * Increments how often a user has been censored
     * @param {string} userID The ID of the user
     * @param {string} userName The name of the user
     * @param {Number} amount How much the stat should be incremented
     */
    incrementCencoredStat(userId, userName, amount = 1) {
        if(!stats.users[userId]) {
            stats.users[userId] = {
                "name": userName
            };
        }
        
        this.incrementStat(this.TIMES_CENCORED, amount);
        this.incrementUserStat(userId, this.TIMES_CENCORED, amount);
    },

    /**
     * Increments a stat in cache and FS
     * @param {String} key Key of the stat to update
     * @param {Number} value Increment stat by this amount, default = 1
     */
    incrementStat(key, value = 1) {
        if(stats[key]) {
            stats[key] += value;
        } else {
            stats[key] = value;
        }
        writeStatsToFs()
    },

    /**
     * Reads a stat and returns it
     * @param {Number} key Key of the stat to return
     * @returns A number representing a given stat
     */
    getStat(key) {
        if(stats[key]) {
            return stats[key];
        }
    },

    /**
     * Increments the counter for one individual tarot and sum of all tarots
     * @param {Number} tarot The tarot that was read and needs to be incremented
     */
    incrementTarotStat(userId, userName, tarot) {
        if(stats.tarots[tarot]) {
            stats.tarots[tarot] += 1;
        } else {
            stats.tarots[tarot] = 1;
        }

        if(!stats.users[userId]){
            stats.users[userId] = {
                "name": userName
            };
        }

        this.incrementStat(this.TAROTS_READ);
        this.incrementUserStat(userId, this.USER_TAROTS_READ);
    },

    /**
     * This function returns the number of times a given tarot was read
     * @param {Number} tarot Tarot number
     * @returns The number of times the given tarot was read
     */
    getTarotStat(tarot) {
        if(stats.tarots[tarot]) {
            return stats.tarots[tarot];
        } else {
            return 0;
        }
    },

    /**
     * Sets a stat for a given user.
     * @param {Number} userId Discord user ID
     * @param {String} userName Discord username
     * @param {String} key Stat key (see class constants)
     * @param {*} value Value of the stat
     */
    setUserStat(userId, userName, key, value) {
        if(!stats.users[userId]) {
            stats.users[userId] = {
                "name": userName,
            };
        }
        
        stats.users[userId][key] = value;
    },
    
    /**
     * Increments one stat entry for one user
     * @param {Number} userId Discord user ID
     * @param {String} key Stat key (see class constants)
     * @param {Number} value Amount that the stat should be incremented
     */
    incrementUserStat(userId, key, value = 1) {
        if(!stats.users[userId])
            stats.users[userId] = {};
        if(stats.users[userId][key]) {
            stats.users[userId][key] += value;
        } else {
            stats.users[userId][key] = value;
        }
        writeStatsToFs();
    },

    /**
     * Increments the emoji usage stat for a given user
     * @param {Number} userId Discord user Id
     * @param {Number} emoji ID of the angry-emoji
     * @param {Number} amount Amount by which the stat is increased
     */
    incrementUserEmoji(userId, emoji, amount = 1) {
        if(!stats.users[userId].emojis) 
            stats.users[userId].emojis = {};
        if(stats.users[userId].emojis[emoji]) {
            stats.users[userId].emojis[emoji] += amount;
        } else {
            stats.users[userId].emojis[emoji] = amount;
        }
        this.incrementUserStat(userId, this.USER_ANGRY_EMOJIS_SENT, amount);
    },

    /**
     * Returns all stats saved for a given user
     * @param {Number} userId Discord user ID
     * @returns All stats for the given user
     */
    getUserStats(userId) {
        if(stats.users[userId]) {
            return stats.users[userId];
        }
    },

    /**
     * Get all saved stats for all users
     * @returns All stats for all users
     */
    getAllUserStats() {
        return stats.users;
    },

    /**
     * Returns how often every emoji has been used, if a user ID is provided then
     * only the emoji usage for this one user is returned.
     * @param {Number} userId Discord user ID
     * @returns How often all emojis have been used
     */
    getUserEmojiStats(userId) {
        if(userId && stats.users[userId]) {
            return stats.users[userId].emojis;
        } else {
            return null;
        }
    },

    /**
     * Returns the stats for all emojis that have been sent
     * @returns All emoji stats
     */
    getEmojiStats() {
        return stats.emojis;
    },

    /**
     * Increments the total number a given angry-emoji has been used
     * @param {Number} emoji Angry-Emoji ID
     * @param {Number} amount Amount by which the stat should be incremented (default 1)
     */
    incrementEmojiStat(emoji, amount = 1) {
        if(stats.emojis[emoji]) {
            stats.emojis[emoji] += amount;
        } else {
            stats.emojis[emoji] = amount;
        }
    },

    /**
     * Takes in an Array of Discord messages and searches through all of them for angry-emojis.
     * Updates the emoji-usage stats accordingly
     * @param {Array<Message>} newMessages An array of Discord messages
     */
    updateTotals(newMessages) {     
        newMessages.forEach(message => {
            if(!stats.users[message.author.id])
                stats.users[message.author.id]= {};
            stats.users[message.author.id].name = message.author.username;
            
            const regex = new RegExp("<:angry([0-9]{1,3}):[0-9]+>", "g");
            const matches = Array.from(message.cleanContent.matchAll(regex), m => m[1]);

            matches.forEach(emoji => {
                this.incrementUserEmoji(message.author.id, emoji);
                this.incrementEmojiStat(emoji);
            });
        });
        console.error("this should never be called now!");
    },

    /**
     * Takes a Discord message as input and updates the total amount of angry emojis sent
     * @param {Message} message Discord message
     */
    updateEmojisSent(message) {
        if(!stats.users[message.author.id])
            stats.users[message.author.id]= {};
        stats.users[message.author.id].name = message.author.username;
        
        const regex = new RegExp("<:angry([0-9]{1,3}):[0-9]+>", "g");
        const matches = Array.from(message.cleanContent.matchAll(regex), m => m[1]);

        matches.forEach(emoji => {
            this.incrementUserEmoji(message.author.id, emoji);
            this.incrementEmojiStat(emoji);
        });
    },

    /**
     * Remembers the last message that has already been included in the stats
     * @param {Number} channelId Discord channel ID
     * @param {Number} messageId Discord message ID
     */
    setLastMessageId(channelId, messageId) {
        lastCachedMessages[channelId] = messageId;
        writeFile(channelCacheFile, JSON.stringify(lastCachedMessages)).catch(err => {
            console.error(err);
        });
    },

    /**
     * Returns the ID of the last message already included in the stats for a given channel
     * @param {Number} channelId Discord channel ID
     * @returns The ID of the last message already included in the stats
     */
    getLastMessageId(channelId) {
        if(!lastCachedMessages[channelId]) {
            return null;
        } else {
            return lastCachedMessages[channelId];
        }
    },

    exportStats() {
        saveStatsToGoogleSheet();
    }
}

/**
 * Writes all currently saved stats to a file if the file is not currently in use
 */
 async function writeStatsToFs() {
    if(!statLock) {
        statLock = true;
        try {
            await writeFile(statFile, JSON.stringify(stats));
        } catch (err) {
            console.error("Writing stats failed: " + JSON.stringify(err));
        }
        statLock = false;
    }
}

/**
 * Write the statFile to the Google Stat Sheet
 * This method is called every day at 23:55
 * Do not call this method if not needed
 */
 function saveStatsToGoogleSheet() {
    const data = [];
    const today = new Date();
    const todayString = today.toLocaleDateString("de-AT");
    data.push(todayString);
    data.push(stats[StatHandler.BOT_ANGRY_REACTIONS]);
    data.push(stats[StatHandler.TAROTS_READ]);
    data.push(stats[StatHandler.DIVOTKEY_REACTIONS]);
    data.push(stats[StatHandler.TIMES_CENCORED]);
    data.push(stats[StatHandler.NON_FEET_RELATED_MESSAGES_DELETED]);
    data.push(stats[StatHandler.YESNO_QUESTIONS_ANSWERED]);

    GoogleSheetHandler.saveToSheet(data);

    const tarotData = [];
    tarotData.push(todayString);

    for (let i = 0; i < 100; i++) {
        if(stats.tarots[i]) {
            tarotData.push(stats.tarots[i]);
        } else {
            tarotData.push(0);
        }
    }

    GoogleSheetHandler.saveTarotDataToSheet(tarotData);

    const userData = [];

    const users = Object.entries(stats.users);
    for ([key, value] of users) {
        // Ignore name-less users
        if(!value.name) {
            continue;
        }

        // Add date first
        const oneUser = [];
        oneUser.push(todayString);
        oneUser.push(value.name);

        // Add tarot data if present
        if(value[StatHandler.USER_TAROTS_READ]) {
            oneUser.push(value[StatHandler.USER_TAROTS_READ]);
        }else {
            oneUser.push(0);
        }

        // Add emojis sent if present
        if(value[StatHandler.USER_ANGRY_EMOJIS_SENT]) {
            oneUser.push(value[StatHandler.USER_ANGRY_EMOJIS_SENT]);
        }else {
            oneUser.push(0);
        }

        // Add times this user has been censored
        if(value[StatHandler.TIMES_CENCORED]) {
            oneUser.push(value[StatHandler.TIMES_CENCORED]);
        }else {
            oneUser.push(0);
        }
        
        // Add yesno questions answered
        if(value[StatHandler.YESNO_QUESTIONS_ANSWERED]) {
            oneUser.push(value[StatHandler.YESNO_QUESTIONS_ANSWERED]);
        }else {
            oneUser.push(0);
        }

        // Add to user array
        userData.push(oneUser);
    }

    GoogleSheetHandler.saveUserDataToSheet(userData);
}

module.exports = StatHandler;