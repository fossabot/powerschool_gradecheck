const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require("fs");
const discordconfig = require("./discord-config.json");
const jsonfile = require('jsonfile');


//discord stuff
client.on("ready", () => {
    console.log(`\nDiscord bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
    client.user.setActivity(`Grading papers on ${client.guilds.size} servers`);
  });
  
  client.on("guildCreate", guild => {

    console.log(`\nNew guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`Grading papers on ${client.guilds.size} servers`);
  });
  
  client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`\nI have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`Grading papers on ${client.guilds.size} servers`);
  });

  // on message
  client.on("message", async message => {
        if(message.author.bot) return;
        if(message.content.indexOf(discordconfig.prefix) !== 0) return;
        const args = message.content.slice(discordconfig.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        
        if(command === "ping") {
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    }
    // shows help screen
    if(command === "help") {
        message.channel.send("**\nCommands for Discord SPS Bot:\n\n**" 
                            +"\n+createaccount <SPS Username> <SPS Password>"
                            +"\n+grades"
                            +"\n+dmgrades"
        );
    }

    if(command === "createaccount") {
        username = args[0];
        password = args[1];

        message.reply('WARNING: Only run this command in a DM to the bot! Make sure your credentials are correct as you will not be able to change them once your account is created!');
        message.reply('Type: "+understood" to continue');

        client.on("message", async message => {
            if(message.author.bot) return;
            if(message.content.indexOf(discordconfig.prefix) !== 0) return;
            const args = message.content.slice(discordconfig.prefix.length).trim().split(/ +/g);
            const command = args.shift().toLowerCase();

            if(command === "understood") {

                if(!username)
                    return message.reply("Please enter a valid username");
                if(!password) 
                    return message.reply("Please enter a valid password");
                var file = 'userinfo.json'

                var obj = {
                    [message.author.id]: [
                        {name: message.author.username},
                        {id: message.author.id},
                        {spsuser: username},
                        {spspass: password}
                    ],
                }
                    

                jsonfile.readFile(file, function(err, data) {
                    var json = [data];
                    json.push(obj);
                    jsonf = JSON.stringify(json, null, 2);
                    jsonf = jsonf.replace(']', '');
                    jsonf = jsonf.replace('[', '');
                    fs.writeFile(file, jsonf, (err) => {  
                        if (err) throw err;
                        console.log('Data written to file');
                    });
                })

                message.delete().catch(error => message.reply(`Couldn't delete messages because of: ${error}`));

                message.author.send('Account Created, you can type +grades to fetch your grades at any time anywhere!');

                require('./puppeteer-gradecheck').check(username, password);
                setTimeout(discordgrades_public, 3000);
            }
        });
    }
    if(command === "grades") {
        var file = 'userinfo.json'
        jsonfile.readFile(file, function(err, obj2) {
            var key = message.author.id;
            var current = obj2[key];
            require('./puppeteer-gradecheck').check(current.spsuser, current.spspass);

        })

        setTimeout(discordgrades_public, 3000);
    }
    function discordgrades_public () {
        message.reply("__**Grades for semester " + global.semester + "...**__")
        message.reply("\nPeriod 1: " + global.p1 + "%" + "\nPeriod2: " + global.p2 + "%" + "\nPeriod3: " + global.p3 + "%" + "\nPeriod4: " + global.p4 + "%" + "\nPeriod5: " + global.p5 + "%" + "\nPeriod6: " + global.p6 + "%");
        username = '';
        password = '';
    }
  });

client.login(discordconfig.token);