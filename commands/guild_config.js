import guild_config_schema from "../schema/guild_config.js"
import { InteractionResponseType } from "discord-interactions";

export async function enabled(guild_id) {
    const guild_config = await guild_config_schema.findById(guild_id)
    const is_enabled = guild_config === null || guild_config.enabled === true;
    return is_enabled
}

export async function update_enabled(res, guild_id, on_off) {
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

    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `${process.env.BOT_NAME} has ${was_on} been ${enable_disable}`
        },
    });
}

export const enable_bot = async (res, guild_id) => await update_enabled(res, guild_id, true)
export const disable_bot = async (res, guild_id) => await update_enabled(res, guild_id, false)