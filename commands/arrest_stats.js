import arrest_count_schema from "../schema/arrest_count.js"
import { SlashCommandBuilder } from "discord.js";

export async function arrests(guild_id, user_id) {
    const query = { guild_id: guild_id, user_id: user_id };
    const result = await arrest_count_schema.findOne(query);
    return (result) ? result.arrest_count : 0
}

export async function get_arrest_stats(guildId) {
    try {
        const query = { guild_id: guildId };
        const results = await arrest_count_schema.find(query, 'user_id arrest_count');
        const stats = results.map(result => ({ user_id: result.user_id, arrest_count: result.arrest_count }));
        return stats;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function reset_arrest_count(interaction) {
    const guildId = interaction.guildId;
    const user = interaction.options.getUser('target');

    const userId = user.id
    if (!user)
        return await interaction.reply('You must mention a user to pardon.');

    try {
        const query = { guild_id: guildId, user_id: userId };
        const update = { arrest_count: 0 };
        const options = { new: true, upsert: true };
        const result = await arrest_count_schema.updateOne(query, update, options);
    } catch (error) {
        console.error(error);
        return await interaction.reply(`An error occurred while pardoning ${user}`)
    }

    const tyranny = user.id === interaction.user.id;
    const tyranny_string = tyranny ? "(OH THE TYRANNY!)" : "";

    return await interaction.reply(`${interaction.user} HAS PARDONED ${user} ${tyranny_string}`)
}

export async function increment_arrests(guild_id, user_id) {
    try {
        const query = { guild_id: guild_id, user_id: user_id };
        const update = { $inc: { arrest_count: 1 } };
        const options = { upsert: true, new: true };
        const result = await arrest_count_schema.findOneAndUpdate(query, update, options);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function show_arrest_stats(interaction) {
    const arrestStats = await get_arrest_stats(interaction.guild.id);

    const formattedStats = arrestStats.map((stat) => {
        const user = interaction.guild.members.cache.get(stat.user_id)?.user;
        const username = user ? user.tag : 'Unknown User';
        return { ['User']: username, ['Arrest Count']: stat.arrest_count };
    });

    const headers = ['User', 'Arrest Count'];
    const columnWidths = headers.map((header) => Math.max(header.length, ...formattedStats.map((stat) => `${stat[header]}`.length)));
    const separator = columnWidths.map((width) => '-'.repeat(width + 2)).join('+');

    const rows = formattedStats
        .sort((a, b) => b['Arrest Count'] - a['Arrest Count'])
        .map((stat) => headers.map((header, index) => ` ${new String(stat[header]).padEnd(columnWidths[index], ' ')} `).join('|'))
        .map((row) => `|${row}|`)

    const table = `|${headers.map((header, index) => ` ${header.padEnd(columnWidths[index], ' ')} `).join('|')}|\n|${separator}|\n${rows.join('\n')}`;

    interaction.reply(`\`\`\`\n${table}\n\`\`\``);
}
export const arrest_stats_command = new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Show server arrest stats')

export const pardon = async (interaction) => await reset_arrest_count(interaction)
export const pardon_command = new SlashCommandBuilder()
    .setName('pardon')
    .setDescription(`Pardon a user's arrests`)
    .addUserOption(option =>
        option
            .setName('target')
            .setDescription('The member to pardon')
            .setRequired(true));