const prefix = "?angry";

module.exports = {
	name: 'help',
	description: 'Information about all possible Commands',
	execute(msg) {
        let commands = "Possible Commands:\n";
        commands += "`" + prefix + " tarot` - Get your daily angry\n";
        commands += "`" + prefix + " stats` - Get all current bot-stats\n";
        commands += "`" + prefix + " tarotcount` - See the number tarots I have read\n";
        commands += "`" + prefix + " count` - Get total amount of angry reactions\n";
        commands += "`" + prefix + " emojilist` - Get top angry emojis, you can also @ a user to get his emojilist\n";
        commands += "`" + prefix + " topspammer` - Get top angry spammers\n";
        msg.channel.send(commands);
	},
};