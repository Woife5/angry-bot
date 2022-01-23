const {
    promises: { readFile, writeFile },
} = require("fs");

const tarotReminderFile = "./stats-and-cache/tarot-reminders.json";

module.exports = {
    name: "tarotreminder",
    description: "Set a reminder to never forget your Tarot again!",
    adminOnly: false,
    args: 1,
    usage: "<enable/disable>",
    async execute(msg, args) {
        const reminder = args[0];
        let allReminders = null;

        try {
            allReminders = JSON.parse(await readFile(tarotReminderFile, "utf8"));
        } catch (err) {
            allReminders = [];
        }

        switch (reminder) {
            case "enable":
                if (allReminders.includes(msg.author.id)) {
                    msg.channel.send("You already have a reminder set!");
                } else {
                    allReminders.push(msg.author.id);
                    msg.channel.send("Your reminder has been set!");
                }
                writeFile(tarotReminderFile, JSON.stringify(allReminders));
                break;
            case "disable":
                if (!allReminders.includes(msg.author.id)) {
                    msg.channel.send("You don't have a reminder set!");
                } else {
                    allReminders.splice(allReminders.indexOf(msg.author.id), 1);
                    msg.channel.send("Your reminder has been removed!");
                }
                writeFile(tarotReminderFile, JSON.stringify(allReminders));
                break;

            default:
                msg.reply("Invalid argument!");
                break;
        }
    },
};
