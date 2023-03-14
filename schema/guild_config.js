import mongoose from "mongoose"
const { Schema, model, models } = mongoose

const guild_config_schema = new Schema({
    _id: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        required: false
    },
    reaction_name: {
        type: String,
        required: false
    },
    loud: {
        type: Boolean,
        required: false
    }
})

const name = "guild-config"

export default models[name] || model(name, guild_config_schema)