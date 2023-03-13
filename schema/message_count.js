const { Schema, model, models } = require("mongoose")

const message_count_schema = new Schema({
    _id: {
        type: String,
        required: true
    },
    message_count: {
        type: Number,
        required: true
    }
})

const name = "message-counts"
module.exports = model[name] || model(name, message_count_schema)