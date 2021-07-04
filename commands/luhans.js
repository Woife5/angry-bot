const StatHandler = require("../helpers/stat-handler.js");

const medienKlausur = new Date('2021-07-02T11:00:00');
const names = [
    'McLuhans',
    'McWuhans',
    'BigMcLuhans',
];

module.exports = {
	name: 'luhans',
	description: 'Get the time since the medien-t test',
    hidden: true,
	execute(msg) {
        // Get a random name from the McLuhan name array
        const random = Math.floor(Math.random() * names.length);

        // Calculate the time since the medien-t test.
        let msSinceKlausur = Date.now() - medienKlausur.getTime();
        const dSinceKlausur = Math.floor(msSinceKlausur/1000/60/60/24);
        msSinceKlausur -= dSinceKlausur*1000*60*60*24;
        
        const hSinceKlausur = Math.floor(msSinceKlausur/1000/60/60);
        msSinceKlausur -= hSinceKlausur*1000*60*60;
        
        const mSinceKlausur = Math.floor(msSinceKlausur/1000/60);
        msSinceKlausur -= mSinceKlausur*1000*60;
        
        const sSinceKlausur = Math.floor(msSinceKlausur/1000);

        msg.channel.send(`${dSinceKlausur} Tage ${hSinceKlausur} Stunden ${mSinceKlausur} Minuten und ${sSinceKlausur} Sekunden sind seit der Medientheorie Klausur mit ${names[random]} vergangen.\nIch hoffe das macht dich wütend.`);
	},
};