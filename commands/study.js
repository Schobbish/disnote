const { DiscordAPIError } = require("discord.js");
let fs = require("fs");
const Discord = require('discord.js');

module.exports = {
    name: 'study',
    description: 'Used to access all study tracker functionality',
    usage: '`!dn study`',
    arguments: 'No additional arguments.',

    execute(message, words) {
        //  Use index 2 because index 0 will be '!dn' and index 1 will be 'study'
        //  Check the third string in words to see which subroutine to run.
        if(words[2] === undefined){
            //message.channel.send('Additional arguments expected. Try using `!dn study help` for more information.');
            /*const additionalArgumentsEmbed = new Discord.MessageEmbed()
                    .setColor('#ff3300')
                    .setTitle("Additional arguments expected")
                    .setDescription('Try using `!dn study help` for more information.');
            message.channel.send(additionalArgumentsEmbed);*/
            const helpEmbed = new Discord.MessageEmbed()
                .setColor('#ff3300')
                .setTitle("!dn study help")
                //.setDescription("`study help                     ` - display all commands in the `study` family.\n `study clockin                  ` - start a tracked study session.\n`study clockout                 ` - end a tracked study session.\n`study leaderboard              ` - display a leaderboard of those with the most study time.\n`study total                    ` - display your total study time")
                .addFields(
                    { name: '`!dn study help`', value: 'display all commands in the `study` family' },
                    { name: '`!dn study clockin`', value: 'start a tracked study session' },
                    { name: '`!dn study clockout`', value: 'end a tracked study session' },
                    { name: '`!dn study leaderboard`', value: 'display a leaderboard of those with the most study time' },
                    { name: '`!dn study total`', value: 'display your total study time' }
                )
            message.channel.send(helpEmbed);
        }
        else{
            switch (words[2].toUpperCase()){    //  Set string to upper case to remove case-sensitivity
                case 'HELP': //!dn study help
                    const helpEmbed = new Discord.MessageEmbed()
                        .setColor('#ff3300')
                        .setTitle("!dn study help")
                        //.setDescription("`study help                     ` - display all commands in the `study` family.\n `study clockin                  ` - start a tracked study session.\n`study clockout                 ` - end a tracked study session.\n`study leaderboard              ` - display a leaderboard of those with the most study time.\n`study total                    ` - display your total study time")
                        .addFields(
                            { name: '`!dn study help`', value: 'display all commands in the `study` family.' },
                            { name: '`!dn study clockin`', value: 'start a tracked study session.' },
                            { name: '`!dn study clockout`', value: 'end a tracked study session.' },
                            { name: '`!dn study leaderboard`', value: 'display a leaderboard of those with the most study time' },
                            { name: '`!dn study total`', value: 'display your total study time' }
                        )
                    message.channel.send(helpEmbed);
                    //message.channel.send('`study help                     ` - display all commands in the `study` family.');
                    //message.channel.send('`study clockin                  ` - start a tracked study session.');
                    //message.channel.send('`study clockout                 ` - end a tracked study session.');
                    //message.channel.send('`study leaderboard              ` - display a leaderboard of those with the most study time');
                    //message.channel.send('`study total                    ` - display your total study time');
                    break;
                case 'CLOCKIN': //!dn study clockin
                    clockin(message);
                    break;
                case 'CLOCKOUT': //!dn study clockout
                    clockout(message);
                    break;
                case 'LEADERBOARD': //!dn study leaderboard
                    leaderboard(message);
                    break;
                case 'TOTAL': //!dn study total
                    total(message);
                    break;
                default:
                    //message.channel.send('Unexpected arguments. Try using `!dn study help` for more information.');
                    const unexpectedArgumentsEmbed = new Discord.MessageEmbed()
                        .setColor('#ff3300')
                        .setTitle("Unexpected arguments")
                        .setDescription('Try using `!dn study help` for more information.');
                    message.channel.send(unexpectedArgumentsEmbed);
                    break;
            }
        }
    }
};

function clockin(message){
    //message.channel.send(message.author.id);
    const data = require('../data/study.json');
    //message.channel.send(JSON.stringify(data));
    var userFound = false;
    for(var i = 0; data.users[i] != undefined; i++){
        if(data.users[i].id == message.author.id){
            userFound = true;
            if(data.users[i].start == 0){
                var d = new Date();
                data.users[i].start = d.getTime();
                var date = new Date(d.getTime());
                var hours = date.getHours();
                var minutes = "0" + date.getMinutes();
                var seconds = "0" + date.getSeconds();
                var formattedTime = hours + ':' + minutes.substr(-2);
                //message.channel.send("Clocked in! Start time: "+formattedTime);
                const clockinEmbed = new Discord.MessageEmbed()
                    .setColor('#ff3300')
                    .setTitle("Clocked in!")
                    .setDescription("Start Time: "+formattedTime)
                    .setThumbnail("https://cdn.discordapp.com/attachments/802619145065594922/815307085994655769/old-professor-points-to-chalkboard-vector.png")
                    .setFooter('Use `!dn study clockout` to clock out');
                message.channel.send(clockinEmbed);
            }
            else{
                //message.channel.send("You are already clocked in!");
                const alreadyClockedinEmbed = new Discord.MessageEmbed()
                    .setColor('#ff3300')
                    .setTitle("You are already clocked in!")
                    .setDescription('Use `!dn study clockout` to clock out');
                message.channel.send(alreadyClockedinEmbed);
            }
            break;
        }
    }
    if(!userFound){
        var i = data.users.length;
        //message.channel.send(i);
        //message.channel.send(JSON.stringify(data));
        data.users[i] = {};
        data.users[i].guildID = message.guild.id;
        data.users[i].id = message.author.id;
        var d = new Date();
        data.users[i].start = d.getTime();
        data.users[i].total = 0;
        var date = new Date(d.getTime());
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        message.channel.send("Clocked in! Start time: "+formattedTime);

    }
    //message.channel.send(JSON.stringify(data));
    fs.writeFileSync("./data/study.json", JSON.stringify(data, null, 4));
}
function clockout(message){
    const data = require('../data/study.json');
    //message.channel.send(JSON.stringify(data));
    var userFound = false;
    for(var i = 0; data.users[i] != undefined; i++){
        if(data.users[i].id == message.author.id){
            userFound = true;
            if(data.users[i].start > 0){
                var d = new Date();
                var timeStudied = d.getTime() - data.users[i].start;
                data.users[i].total += timeStudied;
                data.users[i].start = 0;
                //message.channel.send("Clocked out! You studied for " + (timeStudied/3600000).toFixed(2) + " hours");
                const clockoutEmbed = new Discord.MessageEmbed()
                    .setColor('#ff3300')
                    .setTitle("Clocked out!")
                    .setDescription("You studied for "+(timeStudied/3600000).toFixed(2)+" hours.")
                    .setThumbnail("https://cdn.discordapp.com/attachments/802619145065594922/815433610621485086/33bs6c.png")
                    .setFooter('Use `!dn study total` to check your total study time');
                message.channel.send(clockoutEmbed);
            }
            else{
                //message.channel.send("You are not clocked in!");
                const notClockedinEmbed = new Discord.MessageEmbed()
                    .setColor('#ff3300')
                    .setTitle("You are not clocked in!")
                    .setDescription('Use `!dn study clockin` to clock in');
                message.channel.send(notClockedinEmbed);
            }
            break;
        }
    }
    if(!userFound){
        //message.channel.send("You are not clocked in!");
        const alreadyClockedoutEmbed = new Discord.MessageEmbed()
            .setColor('#ff3300')
            .setTitle("You are not clocked in!")
            .setDescription('Use `!dn study clockin` to clock in');
        message.channel.send(alreadyClockedoutEmbed);
    }
    fs.writeFileSync("./data/study.json", JSON.stringify(data, null, 4));
}

function leaderboard(message){
    const data = require('../data/study.json');
    var totals = [];
    var anyUsers = false;
    for(var i = 0; data.users[i] != undefined; i++){
        if (data.users[i].guildID == message.guild.id){
            anyUsers = true;
            var d = new Date();
            var currTimeStudied = 0;
            if(data.users[i].start != 0)
                currTimeStudied = d.getTime() - data.users[i].start;
            totals.push([data.users[i].total+currTimeStudied, data.users[i].id]);
        }
    }
    if(anyUsers){
        totals.sort(sortFunction);
        var scoreboard = "";

        for(var i = 0; i < totals.length && i < 10; i++){
            // var user = async id => client.users.fetch(totals[i][1]);
            // var user = client.fetchUser(totals[i][1]);

            try {
                var user = message.guild.members.cache.get(totals[i][1]).user.username;
            } catch (TypeError) {
                null;
            }
            scoreboard += "**#"+(i+1)+"\xa0\xa0\xa0\xa0\xa0\xa0\xa0**"+(totals[i][0]/3600000).toFixed(2)+" hours - "+user+"\n";
        }
        //message.channel.send(scoreboard);
        const leaderboardEmbed = new Discord.MessageEmbed()
            .setColor('#ff3300')
            .setTitle("Study Time Leaderboards")
            .setThumbnail('https://cdn.discordapp.com/attachments/802619145065594922/815450542356168733/trophy.gif')
            .setDescription(scoreboard);
        message.channel.send(leaderboardEmbed);
    }
    else{
        //message.channel.send("No users to rank.");
        const noUsersEmbed = new Discord.MessageEmbed()
                    .setColor('#ff3300')
                    .setTitle("No users to rank.")
                    .setDescription('Use `!dn study clockin` to start gaining hours on the leaderboard');
        message.channel.send(noUsersEmbed);
    }
}
function total(message){
    const data = require('../data/study.json');
    for(var i = 0; data.users[i] != undefined; i++){
        if(data.users[i].id == message.author.id){
            //message.channel.send("Your current total time is "+ (data.users[i].total/3600000).toFixed(2)+" hours.");
            const totalEmbed = new Discord.MessageEmbed()
                    .setColor('#ff3300')
                    .setTitle("Total Time")
                    .setDescription("Your total study time is "+(data.users[i].total/3600000).toFixed(2)+" hours.")
                    .setThumbnail("https://cdn.discordapp.com/attachments/802619145065594922/815435423462719488/images.png")
                    .setFooter('Use `!dn study leaderboard` to see how you stack up');
            message.channel.send(totalEmbed);
            return;
        }
    }
    //message.channel.send("Your current total time is 0 hours");
    const totalZeroEmbed = new Discord.MessageEmbed()
                    .setColor('#ff3300')
                    .setTitle("Total Time")
                    .setDescription("Your total study time is 0 hours.")
                    .setThumbnail("https://cdn.discordapp.com/attachments/802619145065594922/815436326916718612/images.png")
                    .setFooter('Use `!dn study clockin` to start your study session');
    message.channel.send(totalZeroEmbed);
}

function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] > b[0]) ? -1 : 1;
    }
}



