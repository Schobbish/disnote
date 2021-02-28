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
            .setThumbnail("https://tenor.com/view/typing-fast-cyber-banana-help-gif-16125910")
        message.channel.send(dingEmbed);
    }
};
