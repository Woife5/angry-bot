const {prefix} = require("../config/bot-constants.json");
const {promises: {readdir}} = require("fs");

let commands = "*Bot Version 4.0.3*\nPossible Commands:\n";
const hiddenCommands = ["help.js", "censorship.js", "censored.js"];

readdir("./commands").then(files => {
    files.filter(file => file.endsWith('.js'));

    for(const file of files) {
        if(hiddenCommands.includes(file)) {
            continue;
        }

        const command = require(`./${file}`);
        commands += `\`${prefix} ${command.name}\` - ${command.adminOnly ? "**admin only** - " : ""}${command.description}\n`;
    }
})

module.exports = {
	name: 'help',
	description: 'Information about all possible Commands',
	execute(msg) {
        msg.channel.send(commands);
	},
};