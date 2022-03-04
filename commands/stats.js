const StatHandler = require("../helpers/stat-handler.js");

module.exports = {
    name: "stats",
    description: "Get a list of all global stats",
    execute(msg) {
        let emojiStats = StatHandler.getEmojiStats();

        emojiStats = Object.entries(emojiStats);
        let angryEmojis = 0;
        for ([key, value] of emojiStats) {
            angryEmojis += value;
        }

        const angryReactions = StatHandler.getStat(StatHandler.BOT_ANGRY_REACTIONS) | 0;
        const tarotsRead = StatHandler.getStat(StatHandler.TAROTS_READ) | 0;
        const romanMentions = StatHandler.getStat(StatHandler.DIVOTKEY_REACTIONS) | 0;
        const cencorships = StatHandler.getStat(StatHandler.TIMES_CENCORED) | 0;
        const feetCensors = StatHandler.getStat(StatHandler.NON_FEET_RELATED_MESSAGES_DELETED) | 0;
        const yesnoQuestions = StatHandler.getStat(StatHandler.YESNO_QUESTIONS_ANSWERED) | 0;
        const catgirls = StatHandler.getStat(StatHandler.NEEKOS_REQUESTED) | 0;
        const russiaSanctions = StatHandler.getStat(StatHandler.RUSSIA_SANCTIONS) | 0;

        let result = `I have reacted angry ${angryReactions.toLocaleString("de-AT")} times.\n`;
        result += `I have read ${tarotsRead.toLocaleString("de-AT")} angry tarots.\n`;
        result += `A total of ${cencorships.toLocaleString("de-AT")} messages have been cencored.\n`;
        result += `A total of ${angryEmojis.toLocaleString("de-AT")} angry emojis have been sent.\n`;
        result += `Roman has been mentioned ${romanMentions.toLocaleString("de-AT")} times.\n`;
        result += `I have answered ${yesnoQuestions.toLocaleString("de-AT")} yes/no questions.\n`;
        result += `I have deleted ${feetCensors.toLocaleString("de-AT")} messages not related to feet.\n`;
        result += `I have sent ${catgirls.toLocaleString("de-AT")} images of catgirls.\n`;
        result += `I have sanctioned russia ${russiaSanctions.toLocaleString("de-AT")} times. 🇺🇦\n`;

        msg.channel.send(result);
    },
};
