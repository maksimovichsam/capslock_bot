import mongoose from 'mongoose';
import config from "../config.json" assert { type: "json" };

export function ConnectDB() {
    mongoose.connect(config.MONGO_URI, {
        keepAlive: true
    })
    .catch(console.log)
}

