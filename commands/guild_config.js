import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import config from "../config.json" assert { type: "json" };
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
    const reply_string = `${config.BOT_NAME} has ${was_on} been ${enable_disable}`

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
    return interaction.reply(`${config.BOT_NAME} is now ${volume}`)
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
    
    return interaction.reply(`${config.BOT_NAME} reaction has been set to :${reaction_name}:`)
}

export const enable_bot = async (interaction) => await update_enabled(interaction, true)
export const enable_command = new SlashCommandBuilder()
    .setName('enable')
    .setDescription(`Enables ${config.BOT_NAME}`);
    
export const disable_bot = async (interaction) => await update_enabled(interaction, false)
export const disable_command = new SlashCommandBuilder()
.setName('disable')
.setDescription(`Disables ${config.BOT_NAME}`);

export const make_loud = async (interaction) => await update_loud(interaction, true)
export const loud_command = new SlashCommandBuilder()
.setName('loud')
.setDescription(`Makes ${config.BOT_NAME} yell responses`);

export const make_quiet = async (interaction) => await update_loud(interaction, false)
export const quiet_command = new SlashCommandBuilder()
.setName('quiet')
.setDescription(`Makes ${config.BOT_NAME} only react`);

const reaction_modal_id = "reaction-modal";
const reaction_input_id = "reaction-modal-input";
export const reaction_modal = async (interaction) => {
    const modal = new ModalBuilder()
        .setCustomId(reaction_modal_id)
        .setTitle(`${config.BOT_NAME}'s reaction`);

    const reaction_input = new TextInputBuilder()
        .setCustomId(reaction_input_id)
        .setLabel(`What reaction do you want ${config.BOT_NAME} to use?`)
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
.setDescription(`Updates ${config.BOT_NAME}'s reaction`);
