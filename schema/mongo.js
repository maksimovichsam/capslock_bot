import mongoose from 'mongoose';
import 'dotenv/config';

export function ConnectDB() {
    mongoose.connect(process.env.MONGO_URI, {
        keepAlive: true
    })
    .catch(console.log)
}

