import { Client, Events, GatewayIntentBits } from "discord.js"
import { ConnectDB } from './schema/mongo.js';
import { RegisterCommands, HandleCommand, HandleMessage } from './commands.js';
import 'dotenv/config';

ConnectDB();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    RegisterCommands();
});

client.on(Events.InteractionCreate, HandleCommand);
client.on(Events.MessageCreate, HandleMessage)

client.login(process.env.DISCORD_TOKEN);