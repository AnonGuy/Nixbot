// Load up the discord.js library
const Discord = require("discord.js");
fs = require('fs');

const client = new Discord.Client();

const config = require("./config.json");
const gotkicked = require("./gotkicked.json");
const joinmessages = require("./joinmessages.json");
const extra = require("./modules/extraneous.js")

config.colors = {
    red: 0x781706,
    orange: 0xBA430D,
    green: 0x037800
}

function loadModules() {
    const eventsFiles = fs.readdir("./events");
    eventsFiles.forEach( file => {
        const name = file.split('.')[0]
    
    })
}

function loadplugins() {
    pluginsfile = fs.readFileSync('./plugins/plugins.json');
    plugins = JSON.parse(pluginsfile);
    return("Reloaded plugins. Current plugins:\n\n`" + Object.keys(plugins) + "`");
}
async function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
}
client.on("ready", () => {
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    client.user.setActivity('type +help');
    const guildsNum = `${client.guilds.size}`;
    const guilds = `${client.guilds.firstKey()}`;
    console.log(loadplugins());

});
var Influx = require('influx');
var influx = new Influx.InfluxDB({
    host: 'oort.zwater.us:8086',
    database: 'nixnest',
    schema: [
        {
            measurement: 'message',
            fields: {
                value: Influx.FieldType.FLOAT,
                manual: Influx.FieldType.FLOAT,
                join: Influx.FieldType.FLOAT,
            },
            tags: [
                'id'
            ]
        }
    ]

});
var checkusers = {};
client.on("guildCreate", guild => {
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on("guildDelete", guild => {
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    //complain to just the devs
    client.channels.get(config.sasschannel).send(gotkicked.message[Math.ceil(Math.random() * gotkicked.messages.length)], {"split":true});

});


client.on("guildMemberAdd", async member => {
    var timestamp = new Date();
    var seconds = Math.round(timestamp / 1000);
    influx.writePoints([
        {
            measurement: 'message',
            tags: { id: member.id },
            fields: { join: seconds },
        }
    ]);
    if (member.guild.id == config.logserver) {
        var message = joinmessages.messages[Math.ceil(Math.random() * joinmessages.messages.length)];
        var finalmessage = message.replace(/\$n/g, member.user.toString());
        var finalmessage = finalmessage.replace(/\$p/g, member.displayName.toString());
        client.channels.get(config.homechannel).send(finalmessage, {"split":true});
    
    }

});

var message = require("./events/message.js");

client.on("message", message.bind(null, config, client, influx));

var messageDelete = require("./events/messageDelete.js");

client.on("messageDelete", messageDelete.bind(null, config, client, influx));

var messageUpdate = require("./events/messageUpdate.js");

client.on("messageUpdate", messageUpdate.bind(null, config, client, influx));

client.login(config.token);

