import 'dotenv/config';
import * as mongoose from 'mongoose';
import express from 'express';
import { userEndpoints } from './endpoints/user.js';
import { eventEndpoints } from './endpoints/events.js';
import { bracketEndpoints } from './endpoints/brackets.js';
import { deckEndpoints } from './endpoints/deck.js';

if (process.env.MONGO_URL === undefined) {
    throw new Error("MONGO_URL is not defined, make sure .env exists and contains a valid MongoDB URL for the MONGO_URL key.");
}
mongoose.connect(process.env.MONGO_URL);

const app = express();

// Set up endpoints
userEndpoints(app);
eventEndpoints(app);
bracketEndpoints(app);
deckEndpoints(app);

async function main() {
    const host = process.env.SERVER_HOST ?? "localhost";
    const port = process.env.SERVER_PORT ?? 8080;

    app.listen(port, () => {
        console.log(`[server]: Server is running at http://${host}:${port}`);
    });
}

main().catch(console.error);