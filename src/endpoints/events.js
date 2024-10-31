import 'express';
import {eventModel} from "../index.js";

/**
 * @param {Express} app 
 */
export function eventEndpoints(app) {
    app.post('/api/event', async (req, res) => {
        
        //create the event
        const newEvent = eventModel({
            eventID: 1,
            eventName: "Spooky Modern Night",
            location: "PSU Behrend",
            playerNum: 0,
            maxPlayers: 24,
            dateTime: "2024-10-31T08:30:01",
            ownerID: 1,
            bracketID: 1
        });

        try {
            await newEvent.save();
            await res.send('Event created.');
        } catch {
            console.log('Error saving test data');
            await res.send('An error occurred.');
        }
        
        
    });

    app.put('/api/event/:id', (req, res) => {
        res.send('Edit Event');
    });

    app.delete('/api/event/:id', async (req, res) => {
        
        let query = {'eventID':1};

        

        try {
            await eventModel.findOneAndDelete(query,null );
            await res.send('Event Deleted.');
        } catch {
            console.log('Error saving test data');
            await res.send('An error occurred.');
        }
    });

    app.get('/api/event/:id', (req, res) => {
        res.send('Get Event Details');
    });

    app.get('/api/event/:id/players', (req, res) => {
        res.send('Get Players');
    });

    app.post('/api/event/:id/players', (req, res) => {
        res.send('Add Players');
    });

    app.delete('/api/event/:id/players', (req, res) => {
        res.send('Remove Players');
    });

    app.post('/api/event/:id/decks', (req, res) => {
        res.send('Add Deck to Event');
    });

    app.delete('/api/event/:id/decks', (req, res) => {
        res.send('Remove Deck from Event');
    });

    app.get('/api/event/:id/decks', (req, res) => {
        res.send('View Decks from Event Library');
    });

    app.get('/api/event/:id/bannedCards', (req, res) => {
        res.send('View Banned Cards');
    });

    app.post('/api/event/:id/bannedCards', (req, res) => {
        res.send('Add Banned Card');
    });

    app.delete('/api/event/:id/bannedCards', (req, res) => {
        res.send('Unban Card');
    });
}