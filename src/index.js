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
mongoose.connect(process.env.MONGO_URL);

//this makes the schema for the user
const userProfileSchema = new mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  userEmail: String,
  password: String,
  description: String,
  wins: Number,
  losses: Number,
  profilePicture: String
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
  cards : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
  user : {type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile'},
  deckWins : Number,
  deckLosses : Number
});
export const deckModel = mongoose.model('Deck', deckSchema);

const matchupSchema = new mongoose.Schema({
  player1: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' },
  player2: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' },
  round: Number,
  player1Deck: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck' },
  player2Deck: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck' },
});

const bracketSchema = new mongoose.Schema({ 
  bracketStyle : String,
  gameFormat : String,
  playerNum : Number,
  maxPlayers : Number,
  players: [{type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile'}],
  finishedMatchups: [matchupSchema],
  eliminatedPlayers: [{type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile'}],
});
export const bracketModel = mongoose.model('Bracket', bracketSchema);

const eventSchema = new mongoose.Schema({ 
  eventName: String,
  location: String,
  maxPlayers: Number,
  dateTime: Date,
  description: String,
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile'},
  bracket: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bracket' }],
  attendees: [{type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile'}],
  decks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Deck'}]
});

// Add a virtual property for playerNum that's always calculated from attendees
eventSchema.virtual('playerNum').get(function() {
  return this.attendees ? this.attendees.length : 0;
});

// Ensure virtuals are included when converting to JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

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

export function isID(id){
  if (mongoose.isValidObjectId(id)){
      return true;
  }
  else{
      return false;
  }
}

async function main() {
  const host = process.env.SERVER_HOST ?? 'localhost';
  const port = process.env.SERVER_PORT ?? 8080;

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://${host}:${port}`);
  });
}

app.delete('/api/deleteAll', async (req, res) => {
  try {
    // Delete all events
    await eventModel.deleteMany({});
    
    // Delete all brackets
    await bracketModel.deleteMany({});
    
    res.status(200).json({ message: 'Successfully deleted all events and brackets' });
  } catch (error) {
    console.error('Error deleting events and brackets:', error);
    res.status(500).json({ error: 'Failed to delete events and brackets' });
  }
});

main().catch(console.error);

