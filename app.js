import 'dotenv/config';
import express from 'express';
import {
    InteractionType,
    InteractionResponseType,
} from 'discord-interactions';
import { VerifyDiscordRequest, ConnectDB } from './utils.js';
import {
    HasGuildCommands,
    ENABLE_COMMAND,
    DISABLE_COMMAND,
} from './commands.js';

import { enable_bot, disable_bot } from './commands/guild_config.js';

// Create an express app
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Create MongoDB
ConnectDB()

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
    // Interaction type and data
    const { type, id, guild_id, data } = req.body;

    if (type === InteractionType.PING)
        return res.send({ type: InteractionResponseType.PONG });

    /**
     * Handle slash command requests
     * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
     */
    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data;

        if (name === ENABLE_COMMAND.name) 
            return await enable_bot(res, guild_id)
        if (name === DISABLE_COMMAND.name) 
            return await disable_bot(res, guild_id)
    }

});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);

    // Check if guild commands from commands.js are installed (if not, install them)
    HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [
        ENABLE_COMMAND,
        DISABLE_COMMAND
    ]);
});
