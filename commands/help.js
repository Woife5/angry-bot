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
        commands += "`" + prefix + " emojilist` - Get top angry emojis\n";
        commands += "`" + prefix + " myemojilist` - Get top angry emojis sent only by you\n";
        commands += "`" + prefix + " topspammer` - Get top angry spammers\n";

        if(msg.author.id === "267281854690754561" || msg.author.id === "138678366730452992" || msg.author.id === "351375977303244800") {
            commands += "\nAdmin Commands:\n";
            commands += "`" + prefix + " flushtarot` - Remove all currently saved tarot emojis\n";
            commands += "`" + prefix + " loadtarot` - Load tarot from cache file\n";
            commands += "`" + prefix + " updatereactions` - Update the internal cache of custom angry reactions\n";
        }

        msg.channel.send(commands);
	},
};