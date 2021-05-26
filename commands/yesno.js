const StatHandler = require("../helpers/stat-handler.js");
const fetch = require("node-fetch");

module.exports = {
	name: 'yesno',
	description: 'Get a yes or no answer to a question',
	adminOnly: false,
	args: 1,
	usage: "<question>",
	async execute(msg, args) {
        const res = await fetch("https://yesno.wtf/api");
        const result = await res.json();
        msg.reply(`The answer is ${result.answer}. I have spoken.`, {"files": [result.image] });
        StatHandler.incrementStat(StatHandler.YESNO_QUESTIONS_ANSWERED);
        StatHandler.incrementUserStat(msg.author.id, StatHandler.YESNO_QUESTIONS_ANSWERED);
	}
};