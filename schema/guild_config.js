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
    },
    filters: {
        type: [String],
        required: false
    },
    criminal_threshold: {
        type: Number,
        required: false,
        default: 10
    },
    criminal_role: {
        type: String,
        required: false
    }
})

const name = "guild-config"

export default models[name] || model(name, guild_config_schema)