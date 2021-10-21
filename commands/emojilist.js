const StatHandler = require("../helpers/stat-handler.js");
const angrys = require("../config/angry-emojis.json");

module.exports = {
    name: "emojilist",
    description: "Get top angry emojis, a user can be mentioned to get only emojis sent by him.",
    async execute(msg) {
        let userId = null;
        let userName = "";
        if (msg.mentions.users.first()) {
            userId = msg.mentions.users.first().id;
            userName = msg.mentions.users.first().username;
        }

        let emojiStats;

        if (userId) {
            emojiStats = StatHandler.getUserEmojiStats(userId);
        } else {
            emojiStats = StatHandler.getEmojiStats();
        }

        if (!emojiStats) {
            msg.channel.send(`${userName} has not sent any Angry Emojis.`);
            return;
        }

        let result = "";
        for (let i = 0; i < angrys.length; i++) {
            if (emojiStats[i + 1]) {
                result +=
                    angrys[i] + " sent " + emojiStats[i + 1] + " times" + (userId ? " by " + userName : "") + ".\n";
            }
            if (result.length >= 1700) {
                msg.channel.send(result);
                result = "";
            }
        }
        msg.channel.send(result);
    },
};
