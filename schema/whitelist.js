import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const whitelist_schema = new Schema({
  guild_id: { type: String, required: true },
  user_id: { type: String, required: true },
  is_whitelisted: { type: Boolean, default: false },
});

const name = "whitelist"
export default models[name] || model(name, whitelist_schema)