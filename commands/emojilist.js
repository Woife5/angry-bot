const StatHandler = require("../helpers/stat-handler.js");
const TotalsUpdater = require("../helpers/totals-updater.js");
const angrys = require("../config/angry-emojis.json");

module.exports = {
	name: 'emojilist',
	description: 'Get top angry emojis, a user can be mentioned after "emojilist" to get only emojis sent by him.',
	async execute(msg) {
        let userId = null;
        let userName = "";
        if(msg.mentions.users.first()){
            userId = msg.mentions.users.first().id;
            userName = " by " + msg.mentions.users.first().username;
        }

        await TotalsUpdater.updateTotalsForAllChannels(msg.channel);
        const emojiStats = StatHandler.getEmojiStats(userId);
        if(!emojiStats) {
            msg.channel.send("You have not sent any angry emojis.");
            return;
        }

        let result = "";
        for (let i = 0; i < angrys.length; i++) {
            if(emojiStats[i+1]) {
                result += angrys[i] + " sent " + emojiStats[i+1] + " times"+ userName +".\n";
            }
            if(result.length >= 1700) {
                msg.channel.send(result);
                result = "";
            }
        }
        msg.channel.send(result);
	},
};