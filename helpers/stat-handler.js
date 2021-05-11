const {promises: {readFile, writeFile}} = require("fs");
const statFile = "./stats-and-cache/angry-stats.json";

class AngryStatHandler {
    // Stat constants
    BOT_ANGRY_REACTIONS = "angry-reactions-by-bot";
    TAROTS_READ = "angry-tarots-read";
    TOTAL_ANGRY_EMOJIS_SENT = "angry-emois-sent";
    USER_ANGRY_EMOJIS_SENT = "angry-emojis-sent";
    USER_TAROTS_READ = "angry-tarots-requested";

    stats = {}

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
    incrementTarotStat(tarot) {
        if(this.stats.tarots[tarot]) {
            this.stats.tarots[tarot] += 1;
        } else {
            this.stats.tarots[tarot] = 1;
        }

        this.incrementStat(this.TAROTS_READ);
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

    setIndividualStat(userId, userName, key, value) {
        if(!this.stats.users[userId]) {
            this.stats.users[userId] = {
                "name": userName,
            };
        }
        
        this.stats.users[userId][key] = value;
    }
    
    setIndividualStat(userId, key, value) {
        if(this.stats.users[userId]) {
            this.stats.users[userId][key] = value;
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
    }
}

module.exports = AngryStatHandler;