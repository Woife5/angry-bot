const {promises: {readFile}} = require("fs");

const censordEmojiCacheFile = "./stats-and-cache/censored-emoji.json";
let censordEmoji;

async function readCache() {
	try {
		const fileBuffer = await readFile(censordEmojiCacheFile);
		const emojiCache = JSON.parse(fileBuffer.toString());
		censordEmoji = new Set(emojiCache);
	} catch (error) {
		console.error("Something went wrong reading the cencorship file.");
		console.error(error);
	}
}

module.exports = {
	name: 'censored',
	description: 'Get a list of currently censored emojis',
	async execute(msg) {
        await readCache();

        msg.channel.send(`List of censored emoji:`);

		let reply = "";
		censordEmoji.forEach(emoji => {
			reply += `${emoji} `;
		});
		msg.channel.send(reply);
	}
};