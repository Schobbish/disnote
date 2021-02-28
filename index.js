const fs = require('fs');
const Discord = require('discord.js');
// you should not have recieved a copy of bot-token.json.
// if you have, you need to contact the repo's owner. thanks!
const token = require('./bot-token.json');
const client = new Discord.Client();

const prefix = '!dn';

// get commands in commands/ and loop through them
let commands = new Map();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (let file of commandFiles) {
    let command = require(`./commands/${file}`);
    // command name: command module
    commands.set(command.name, command);
}

client.on('ready', function() {
    console.log('Ready! Press ctrl+c to quit');
    client.user.setActivity(`\`${prefix} help\``);

    var timer = setInterval(tickAction, 1000);
});

client.on('message', function(message) {
    words = message.content.split(' ');
    // check for my prefix
    if (words[0] === '!dn') {
        // check if command actually exists
        if (commands.has(words[1])) {
            try {
                if (words[1] === 'help') {
                    // help is a special command and needs the commands object
                    commands.get('help').execute(message, words, commands);
                } else {
                    commands.get(words[1]).execute(message, words);
                }
            } catch (error) {
                console.error(error);
                message.channel.send('error');
            }
        } else {
            if (words[1] === undefined) {
                // this is when `prefix` and nothing else
                commands.get('help').execute(message, words, commands);
            } else {
                message.channel.send(`\`${words[1]}\` is not one of my commands. Try \`${prefix} help\` for help.`);
            }
        }
    }
});

client.login(token.Token);

function tickAction(){
    reminderChecker();
}


function reminderChecker(){
    const data = require('./data/reminders.json');

    for (let i = 0; i < data.reminders.length; i++) {
        if(data.reminders[i].time < Date.now() && data.reminders[i]['date set']) {
            client.channels.cache.get(data['reminder settings'].channel).send("@everyone Reminder for " + data.reminders[i].reminder);
            if(data.reminders[i].repeat === 0) {
                data.reminders.splice(i, 1);
            } else {
                data.reminders[i].time += data.reminders[i].repeat;
            }
            fs.writeFileSync("./data/reminders.json", JSON.stringify(data, null, 4));
        }
    }
}
