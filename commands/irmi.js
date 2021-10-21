module.exports = {
    name: "irmi",
    description: "Just ignore the request",
    hidden: true,
    execute(msg) {
        // msg.channel.send('I\'m not doing anything');
        // no seriously, this is not doing anthing.

        // okay maybe react with a sleepy emoji
        msg.react("😴");
    },
};
