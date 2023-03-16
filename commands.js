import { REST, Routes, Collection } from 'discord.js';
import 'dotenv/config';
import { enabled, make_quiet, disable_bot, disable_command, enable_bot, enable_command, loud_command, make_loud, quiet_command, reaction, reaction_command, reaction_modal, reaction_modal_response, loud, filterAction, filterCommand, getFilters } from './commands/guild_config.js';
import { is_emoji, removeEmotesFromString, removeUrlsFromString } from './util.js';
import { arrests, arrest_stats_command, increment_arrests, pardon, pardon_command, show_arrest_stats } from './commands/arrest_stats.js';
import { IsUserWhitelisted, whitelist_command, whitelist } from './commands/whitelist.js';

const APP_ID = process.env.APP_ID;
const GUILD_ID = process.env.GUILD_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const commands_list = [
    { command: enable_command, action: enable_bot },
    { command: disable_command, action: disable_bot },
    { command: loud_command, action: make_loud },
    { command: quiet_command, action: make_quiet }, 
    { command: reaction_command, action: reaction_modal, response: reaction_modal_response }, 
    { command: pardon_command, action: pardon },
    { command: arrest_stats_command, action: show_arrest_stats },
    { command: whitelist_command, action: whitelist },
    { command: filterCommand, action: filterAction }
]

const COMMANDS = new Collection()
for (const {command, action, response} of commands_list) {
    COMMANDS.set(command.name, action)
    if (response)
        COMMANDS.set(response.modal_id, response.action)
}

export async function RegisterCommands() {
    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN); 

    try {
		console.log(`Started refreshing ${commands_list.length} application (/) commands.`);

        const commands_json = commands_list.map(({command}) => command.toJSON());
		const data = await rest.put(
            (process.env.DEBUG_MODE && process.env.DEBUG_MODE == "TRUE")
                ? Routes.applicationGuildCommands(APP_ID, GUILD_ID) // for a specific guild
                : Routes.applicationCommands(APP_ID), 
			{ body: commands_json },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
}

async function RunCommand(interaction, command_name) {
    console.log(interaction)
    const command = COMMANDS.get(command_name);
    if (command === undefined || command === null) {
        console.log(`Could not find command with name ${command_name} from ${interaction}`);
        return;
    }
    command(interaction)
}

export async function HandleCommand(interaction) {
    const guild_id = interaction.guildId;
    if (process.env.DEBUG_MODE && process.env.DEBUG_MODE == "TRUE" && guild_id != process.env.GUILD_ID) return;

    if (interaction.isModalSubmit())
        return RunCommand(interaction, interaction.customId)
        
    if (interaction.isChatInputCommand())
        return RunCommand(interaction, interaction.commandName)
}

export async function HandleMessage(message) {
    if (message.author.bot) return;
    
    const guild_id = message.guildId;
    if (process.env.DEBUG_MODE && process.env.DEBUG_MODE == "TRUE" && guild_id != process.env.GUILD_ID) return;

    const is_enabled = await enabled(guild_id)
    if (!is_enabled)
        return;

    const user_id = message.author.id;
    const user_whitelisted = await IsUserWhitelisted(guild_id, user_id);
    if (user_whitelisted)
        return;

    let filters = await getFilters(message.guildId);
    let message_content = removeUrlsFromString(message.content);
    message_content = removeEmotesFromString(message_content)
    for (const regex of filters)
        message_content = message_content.replace(regex, '')

    const is_all_caps = message_content === message_content.toUpperCase();
    if (!is_all_caps) { 
        await increment_arrests(guild_id, user_id);
        let reaction_name = await reaction(message.guildId) ?? '🚨'
        if (!is_emoji(reaction_name)) {
            reaction_name = message.guild.emojis.cache.find(emoji => emoji.name === reaction_name) ?? '🚨';
        }
        message.react(reaction_name)

        const is_loud = await loud(guild_id);
        if (is_loud) {
            const server_name = message.guild.name;
            const user = message.author.toString();
            const arrests_count = await arrests(guild_id, user_id)
            const times = `${arrests_count} ${arrests_count <= 1 ? 'TIME' : 'TIMES'}`
            message.reply(`${user} STOP! YOU HAVE BROKEN THE LAW'S OF **${server_name}** (${times}) 🚧`)
        }
    }
}

export default COMMANDS;