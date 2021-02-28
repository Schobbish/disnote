const Discord = require('discord.js');
module.exports = {
    name: 'ding',
    description: 'says dong',
    usage: '`!dn ding`',
    arguments: 'No additional arguments.',

    execute(message, words) {
        //message.channel.send(words);
        //message.channel.send("**DONG**");
        const dingEmbed = new Discord.MessageEmbed()
            .setColor('#ff3300')
            .setTitle("**DONG**")
            // .setThumbnail("https://media.discordapp.net/attachments/814306526687658065/815615528680554508/tenor.gif")
        message.channel.send(dingEmbed);
    }
};
