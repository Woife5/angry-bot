const StatHandler = require("../helpers/stat-handler.js");

module.exports = {
	name: 'luhans',
	description: 'Get a random McLuhan name',
	execute(msg) {
        const names = [
            'McLuhans',
            'McWuhans',
            'BigMcLuhans',
        ];
        const random = Math.floor(Math.random() * names.length);

        msg.channel.send(`${names[random]} wird dich heute auf deinem Weg begleiten!`);
	},
};