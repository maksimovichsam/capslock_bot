import mongoose from "mongoose"
const { Schema, model, models } = mongoose

const arrest_count_schema = new Schema({
    guild_id: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    arrest_count: {
        type: Number,
        required: true,
        default: 0
    }
})

arrest_count_schema.index({ guild_id: 1, user_id: 1 }, { unique: true });

const name = "arrest-counts"
export default models[name] || model(name, arrest_count_schema)