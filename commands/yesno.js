const StatHandler = require("../helpers/stat-handler.js");
const fetch = require("node-fetch");

module.exports = {
	name: 'yesno',
	description: 'Get a yes or no answer to a question',
	adminOnly: false,
	args: 1,
	usage: "<question>",
	async execute(msg, args) {
		// load result from api and parse response
        const res = await fetch("https://yesno.wtf/api");
        const result = await res.json();

		// send answer
        msg.reply(`The answer is ${result.answer}. I have spoken.`, {"files": [result.image] });

		// increment stats
        StatHandler.incrementStat(StatHandler.YESNO_QUESTIONS_ANSWERED);
        StatHandler.incrementUserStat(msg.author.id, StatHandler.YESNO_QUESTIONS_ANSWERED);
	}
};