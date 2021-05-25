const {prefix} = require("../config/bot-constants.json");
const {promises: {readdir}} = require("fs");
const {version} = require("../package.json");

let commands = `*Bot Version ${version}*\nPossible Commands:\n`;
const hiddenCommands = ["help.js", "censorship.js", "censored.js", "exportstats.js"];

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