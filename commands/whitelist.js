import { SlashCommandBuilder } from "discord.js";
import WhitelistedModel from "../schema/whitelist.js"

// Retrieve whether a user in a guild is whitelisted
export async function IsUserWhitelisted(guildId, userId) {
    try {
        const doc = await WhitelistedModel.findOne({ guild_id: guildId, user_id: userId });
        return doc ? doc.is_whitelisted : false;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function UpdateWhitelisted(interaction) {
    const { guildId: guild_id } = interaction;
    const user = interaction.options.getUser('target');
    const user_id = user.id;

    const whitelisted = await IsUserWhitelisted(guild_id, user_id);

    await WhitelistedModel.findOneAndUpdate({
        guild_id: guild_id,
        user_id: user_id
    },
        {
            is_whitelisted: !whitelisted
        },
        {
            upsert: true
        })

    const verb = whitelisted ? "taken off the whitelist" : "whitelisted";

    return await interaction.reply(`${user} has been ${verb}`)
}

export const whitelist = async (interaction) => await UpdateWhitelisted(interaction)
export const whitelist_command = new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription(`Grants a user immunity from ${process.env.BOT_NAME}. Use twice to undo.`)
    .addUserOption(option =>
        option
            .setName('target')
            .setDescription('The user to whitelist')
            .setRequired(true));