const {prefix} = require("../config/bot-constants.json");
const {promises: {readdir}} = require("fs");

let commands = "Possible Commands:\n";

readdir("./commands").then(files => {
    files.filter(file => file.endsWith('.js'));

    for(const file of files) {
        if(file == "help.js") {
            continue;
        }
        
        const command = require(`./commands/${file}`);
        if(command.adminOnly) {
            commands += "Admin only: ";
        }else {
            commands += `\`${prefix} ${command.name}\` - ${command.description}\n`;
        }
    }
})

module.exports = {
	name: 'help',
	description: 'Information about all possible Commands',
	execute(msg) {
        msg.channel.send(commands);
	},
};