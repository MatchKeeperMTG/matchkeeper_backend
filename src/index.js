import 'dotenv/config';
import * as mongoose from 'mongoose';
import express from 'express';
import { userEndpoints } from './endpoints/user.js';
import { eventEndpoints } from './endpoints/events.js';
import { bracketEndpoints } from './endpoints/brackets.js';
import { deckEndpoints } from './endpoints/deck.js';

if (process.env.MONGO_URL === undefined) {
  throw new Error('MONGO_URL is not defined, make sure .env exists and contains a valid MongoDB URL for the MONGO_URL key.');
}
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

//this makes the schema for the user
const userProfileSchema = new mongoose.Schema({

    username: String,
    firstName: String,
    lastName: String,
    userEmail: String,
    password: String,
    wins: Number,
    losses: Number
  });
  //applies the schema to a model
  export const userProfileModel = mongoose.model('UserProfile', userProfileSchema);

  const cardSchema = new mongoose.Schema({ 
    cardName : String,
    cardImage : String,
    cardFormats : [String],
    cardData : [String]
  });
  export const cardModel = mongoose.model('Card', cardSchema);

  const deckSchema = new mongoose.Schema({ 
    deckName : String,
    cards : [cardSchema],
    user : userProfileSchema,
    deckWins : Number,
    deckLosses : Number
  });
  export const deckModel = mongoose.model('Deck', deckSchema);

  const bracketSchema = new mongoose.Schema({ 
    bracketStyle : String,
    gameFormat : String,
    playerNum : Number,
    maxPlayers : Number,
    players : [userProfileSchema],
  });
  export const bracketModel = mongoose.model('Bracket', bracketSchema);

  const eventSchema = new mongoose.Schema({ 
    eventName : String,
    location : String,
    playerNum : Number,
    maxPlayers : Number,
    dateTime : Date,
    owner : userProfileSchema,
    bracket : [bracketSchema],
    attendees : [userProfileSchema]
  });
  export const eventModel = mongoose.model('Event', eventSchema);

//applies the schema to a model

const app = express();

// JSON middleware - this parses the JSON body of POST requests.
app.use(express.json());

// Set up endpoints
userEndpoints(app);
eventEndpoints(app);
bracketEndpoints(app);
deckEndpoints(app);

// Serve frontend
app.use('/', express.static('frontend/dist'));

app.get('/status', (req, res) => {
  res.send('OK');
});

async function main() {
  const host = process.env.SERVER_HOST ?? 'localhost';
  const port = process.env.SERVER_PORT ?? 8080;

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://${host}:${port}`);
  });
}

main().catch(console.error);

