const StatHandler = require("../helpers/stat-handler.js");

module.exports = {
	name: 'exportstats',
	description: 'Export stats to google sheet',
	adminOnly: true,
	execute(msg, args) {
        StatHandler.exportStats();
	}
};