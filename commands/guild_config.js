import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import 'dotenv/config';
import guild_config_schema from "../schema/guild_config.js"

export async function enabled(guild_id) {
    const guild_config = await guild_config_schema.findById(guild_id)
    const is_enabled = guild_config === null || guild_config.enabled === true;
    return is_enabled
}

export async function loud(guild_id) {
    const guild_config = await guild_config_schema.findById(guild_id);
    const default_value = false;
    return (guild_config === null) ? default_value : guild_config.loud
}

export async function reaction(guild_id) {
    const guild_config = await guild_config_schema.findById(guild_id);
    return (guild_config === null) ? null : guild_config.reaction_name
}

export async function update_enabled(interaction, on_off) {
    const { guildId: guild_id } = interaction;
    const is_enabled = await enabled(guild_id)

    await guild_config_schema.findOneAndUpdate({
        _id: guild_id
    },
        {
            _id: guild_id,
            enabled: on_off
        },
        {
            upsert: true
        })

    const enable_disable = (on_off) ? "enabled" : "disabled"
    const was_on = (is_enabled === on_off) ? "already" : "successfully"
    const reply_string = `${process.env.BOT_NAME} has ${was_on} been ${enable_disable}`

    return await interaction.reply(reply_string)
}

export async function update_loud(interaction, on_off) {
    const { guildId: guild_id } = interaction;

    await guild_config_schema.findOneAndUpdate({
        _id: guild_id
    },
        {
            _id: guild_id,
            loud: on_off
        },
        {
            upsert: true
        })

    const volume = (on_off) ? "loud" : "quiet"
    return interaction.reply(`${process.env.BOT_NAME} is now ${volume}`)
}

export async function update_reaction(interaction, reaction_name) {
    const { guildId: guild_id } = interaction;

    await guild_config_schema.findOneAndUpdate({
        _id: guild_id
    },
        {
            _id: guild_id,
            reaction_name: reaction_name
        },
        {
            upsert: true
        })

    return interaction.reply(`${process.env.BOT_NAME} reaction has been set to :${reaction_name}:`)
}

export const enable_bot = async (interaction) => await update_enabled(interaction, true)
export const enable_command = new SlashCommandBuilder()
    .setName('enable')
    .setDescription(`Enables ${process.env.BOT_NAME}`);

export const disable_bot = async (interaction) => await update_enabled(interaction, false)
export const disable_command = new SlashCommandBuilder()
    .setName('disable')
    .setDescription(`Disables ${process.env.BOT_NAME}`);

export const make_loud = async (interaction) => await update_loud(interaction, true)
export const loud_command = new SlashCommandBuilder()
    .setName('loud')
    .setDescription(`Makes ${process.env.BOT_NAME} yell responses`);

export const make_quiet = async (interaction) => await update_loud(interaction, false)
export const quiet_command = new SlashCommandBuilder()
    .setName('quiet')
    .setDescription(`Makes ${process.env.BOT_NAME} only react`);

const reaction_modal_id = "reaction-modal";
const reaction_input_id = "reaction-modal-input";
export const reaction_modal = async (interaction) => {
    const modal = new ModalBuilder()
        .setCustomId(reaction_modal_id)
        .setTitle(`${process.env.BOT_NAME}'s reaction`);

    const reaction_input = new TextInputBuilder()
        .setCustomId(reaction_input_id)
        .setLabel(`What reaction do you want ${process.env.BOT_NAME} to use?`)
        .setStyle(TextInputStyle.Short);

    const action_row = new ActionRowBuilder().addComponents(reaction_input);

    modal.addComponents(action_row);
    await interaction.showModal(modal);
}
export const reaction_modal_response = {
    modal_id: reaction_modal_id,
    action: async (interaction) => {
        const reaction_field = interaction.fields.getTextInputValue(reaction_input_id)
        await update_reaction(interaction, reaction_field)
    }
}

export const reaction_command = new SlashCommandBuilder()
    .setName('reaction')
    .setDescription(`Updates ${process.env.BOT_NAME}'s reaction`);


async function addFilter(guildId, filterString) {
    const guildConfig = await guild_config_schema.findById(guildId)
    if (guildConfig) {
        guildConfig.filters.push(filterString);
        await guildConfig.save();
    }
}

async function removeFilter(guildId, filterString) {
    const guildConfig = await guild_config_schema.findById(guildId);
    if (guildConfig) {
        const exists = guildConfig.filters.some(f => f === filterString)
        if (!exists) return false
        guildConfig.filters = guildConfig.filters.filter(f => f !== filterString);
        await guildConfig.save();
        return true
    }
}

export async function getFilters(guildId) {
    const guildConfig = await guild_config_schema.findById(guildId);
    if (guildConfig) {
        return guildConfig.filters;
    }
    return null;
}

async function clearFilters(guildId) {
    await guild_config_schema.findByIdAndUpdate(
        guildId,
        { filters: [] },
        { new: true, upsert: true }
    )
}

export const filterAction = async (interaction) => {
    const { commandName, options } = interaction;

    if (commandName === 'filter') {
        const subCommand = options.getSubcommand();

        if (subCommand === 'add') {
            const regex = options.getString('regex');
            await addFilter(interaction.guildId, regex);
            await interaction.reply(`Filter \`${regex}\` added.`);
        }
        else if (subCommand === 'delete') {
            const regex = options.getString('regex');
            const success = await removeFilter(interaction.guildId, regex);
            if (success === true)
                await interaction.reply(`Filter \`${regex}\` removed.`);
            else if (success === false)
                await interaction.reply(`Filter \`${regex}\` does not exist.`);
            else
                await interaction.reply(`Filter \`${regex}\` was not removed for an unknown error.`);
        }
        else if (subCommand === 'clear') {
            await clearFilters(interaction.guildId);
            await interaction.reply(`All filters cleared.`);
        }
        else if (subCommand === 'list') {
            const filters = await getFilters(interaction.guildId);
            const filterList = filters.length != 0 ? filters.join('\n') : 'No filters set.';
            await interaction.reply(`Filters:\n\`\`\`\n${filterList}\n\`\`\``);
        }
    }
}

export const filterCommand = new SlashCommandBuilder()
    .setName('filter')
    .setDescription('Add or delete a regex filter for your guild.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('Add a regex filter for your guild.')
            .addStringOption(option =>
                option.setName('regex')
                    .setDescription('The regex filter to add.')
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('delete')
            .setDescription('Delete a regex filter from your guild.')
            .addStringOption(option =>
                option.setName('regex')
                    .setDescription('The regex to delete.')
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('list')
            .setDescription('List current filters within your guild.'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('clear')
            .setDescription('Remove all filters from your guild.'))


async function setCriminalThreshold(guildId, threshold) {
    try {
        const update = {
            criminal_threshold: threshold
        };
        await guild_config_schema.findByIdAndUpdate(guildId, update, { upsert: true });
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getCriminalThreshold(guildId) {
    try {
        const result = await guild_config_schema.findById(guildId);
        if (result) {
            return result.criminal_threshold;
        }
        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function setCriminalRole(guildId, roleId) {
    try {
        const update = {
            criminal_role: roleId
        };
        const result = await guild_config_schema.findByIdAndUpdate(guildId, update, { upsert: true });
        if (result) {
            return result.criminal_role;
        }
        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getCriminalRole(guildId) {
    try {
        const result = await guild_config_schema.findById(guildId);
        console.log(guildId, result)
        if (result) {
            return result.criminal_role;
        }
        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const criminalAction = async (interaction) => {
    const { commandName, options } = interaction;

    if (commandName === 'criminal') {
        const subCommand = options.getSubcommand();

        if (subCommand === 'threshold') {
            const threshold = options.getNumber('threshold');
            return setCriminalThreshold(interaction.guild.id, threshold)
                .then(() => interaction.reply(`Criminal threshold set to ${threshold}`))
                .catch(() => interaction.reply('Failed to set criminal threshold.'))
        }
        else if (subCommand === 'role') {
            const role_name = options.getString('role')
            const guild_roles = await interaction.guild.roles.fetch();
            const role_exists = guild_roles.some(role => role.name === role_name)
            if (!role_exists)
                return await interaction.reply(`Sorry, the role '${role_name}' does not exist in this guild.`)
            return setCriminalRole(interaction.guild.id, role_name)
                .then(() => interaction.reply(`Criminal role has been set to '${role_name}'`))
                .catch(() => interaction.reply(`Failed to set the criminal role`))
        }
    }
}

export const criminalCommand = new SlashCommandBuilder()
    .setName('criminal')
    .setDescription('Modify criminal settings.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('threshold')
            .setDescription('Set the arrest threshold to be a criminal in this guild.')
            .addNumberOption(option =>
                option.setName('threshold')
                    .setDescription('The number of arrests to be a criminal.')
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('role')
            .setDescription('Set the Discord role to attach to criminals')
            .addStringOption(option =>
                option.setName('role')
                    .setDescription('The name of the role that criminals will receive')
                    .setRequired(true)))

