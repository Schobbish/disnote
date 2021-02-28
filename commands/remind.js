const Discord = require('discord.js');
module.exports = {
    name: 'remind',
    description: 'Used to remind people',
    usage: '`!dn remind`',
    arguments: 'No additional arguments.',

    execute(message, words) {
        //  Use index 2 because index 0 will be '!dn' and index 1 will be 'remind'
        //  Check the third string in words to see which subroutine to run.
        if(words[2] === undefined){
            //message.channel.send('Additional arguments expected. Try using `!dn remind help` for more information.');
            const helpEmbed = new Discord.MessageEmbed()
                .setColor('#090752')
                .setTitle("!dn remind help")
                .addFields(
                    { name: '`!dn remind help`', value: 'display all commands in the `remind` family' },
                    { name: '`!dn remind <message>`', value: 'set a reminder for a specific date and time' }
                )
            message.channel.send(helpEmbed);
        }
        else{
            switch (words[2].toUpperCase()){    //  Set string to upper case to remove case-sensitivity
                case 'DATE': // !dn reminder date [day] [month (first three letters)] [year] [hours]:[minutes]:[seconds] [repeat interval (weekly/daily/never)]
                    if(message.channel.type === "dm") {
                        if(words[3]
                        && words[4]
                        && words[5]
                        && words[6]) {
                            const data = require('../data/reminders.json');

                            for (let i = data.reminders.length - 1; i >= 0; i++) {
                                if(data.reminders[i].user === message.author.id && !data.reminders['date set']) {
                                    if(data.reminders[i].type === 'alarm') {
                                        if(words[7]) {
                                            data.reminders[i].time = Date.parse(words.slice(3, 7).join(" ") + ' ' + data['reminder settings']['time zone']);
                                            console.log(data.reminders[i].time);
                                            data.reminders[i]['date set'] = true;
                                            if(words[7].toUpperCase() === 'NEVER') {
                                                data.reminders[i].repeat = 0;
                                                message.channel.send("Reminder created!");
                                            }
                                            else if(words[7].toUpperCase() === 'WEEKLY') {
                                                data.reminders[i].repeat = 604800000;
                                                message.channel.send("Reminder created!");
                                            }
                                            else if(words[7].toUpperCase() === 'DAILY') {
                                                data.reminders[i].repeat = 86400000;
                                                message.channel.send("Reminder created!");
                                            } else {
                                                data.reminders[i]['date set'] = false;
                                            }
                                        }
                                    }
                                    var fs = require('fs');
                                    fs.writeFileSync("./data/reminders.json", JSON.stringify(data, null, 4));
                                    break;
                                }
                            }
                        }
                    }

                    break;

                case 'HELP': //!dn remind help
                    //message.channel.send('`remind help                    ` - display all commands in the `remind` family.');
                    //message.channel.send('`remind alarm [name]            ` - set a reminder for a specific date and time.');
                    //message.channel.send('`remind timer [name]            ` - set a reminder that will go off in a certain amount of time.');
                    const helpEmbed = new Discord.MessageEmbed()
                        .setColor('#090752')
                        .setTitle("!dn remind help")
                        .addFields(
                            { name: '`!dn remind help`', value: 'display all commands in the `remind` family.' },
                            { name: '`!dn remind <message>`', value: 'set a reminder for a specific date and time.' }
                        )
                    message.channel.send(helpEmbed);
                    break;

                default:
                    if(words[3]) {
                        let name = words.slice(3).join(" ");

                        message.author.createDM().then(function(ch) {
                            ch.send("Creating a reminder for " + name + ". Please enter the date and time of the reminder using `!dn remind date [day] [month (first three letters)] [year] [hours]:[minutes]:[seconds] [repeat interval (weekly/daily/never)]`.");
                        });

                        let data = require('../data/reminders.json');
                        data.reminders.push(
                            {
                                "reminder": name,
                                "time": 0,
                                "repeat": 0,
                                "type": "alarm",
                                "user": message.author.id,
                                "date set": false
                            }
                        );
                        var fs = require('fs');
                        fs.writeFileSync("./data/reminders.json", JSON.stringify(data, null, 4));
                    } else {
                        message.channel.send('Unexpected arguments. Remember that the format of alarm is !dn remind alarm [name]');
                    }
                    break;
            }
        }
    }
};

