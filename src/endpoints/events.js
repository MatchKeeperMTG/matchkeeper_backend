import express from 'express';
import {eventModel} from "../index.js";

/**
 * @param {express.Express} app 
 */
export function eventEndpoints(app) {
    /*
    i completely forgot that you were doing events and i was doing brackets just accept your own changes over these when there's a merge
    rip
    */
    app.get('/api/event', async (req, res) => {
        const results = await eventModel.find();

        let resultsModified = [];

        for(const event of results) {
            resultsModified.push({
                "eventName": event.eventName,
                "location": event.location,
                "playerNum": event.playerNum,
                "maxPlayers": event.maxPlayers,
                "dateTime": event.dateTime
            });
        }

        await res.send(resultsModified);
    });

    /**
     * Creates an empty event.
     * Input Schema:
     * {
     *  "eventName": string, // Required, name of the event
     *  "location": string, // Required, location of the event
     *  "maxPlayers": number, // Required, maximum allowed players
     *  "dateTime": number // Required, date-time for the event
     * }
     * Response Schema:
     * {
     *  "id": string, // The unique ID of the created event
     * }
     */
    app.post('/api/event', async (req, res) => {
        const body = req.body;

        if(body.eventName === undefined) {
            res.status(400);
            await res.send({"error": "'name' field not specified."});
            return;
        }

        if(body.location === undefined) {
            res.status(400);
            await res.send({"error": "'location' field not specified."});
            return;
        }

        if(body.maxPlayers === undefined) {
            res.status(400);
            await res.send({"error": "'maxPlayers' field not specified."});
            return;
        }

        if(body.dateTime === undefined) {
            res.status(400);
            await res.send({"error": "'dateTime' field not specified."});
            return;
        }

        const newEvent = new eventModel({
            "eventID": -1000,
            "eventName": body.eventName,
            "location": body.location,
            "playerNum": 0,
            "maxPlayers": body.maxPlayers,
            "dateTime": body.dateTime,
            "ownerID": 999999,
            "brackets": []
        });
        await newEvent.save();

        res.send({"id": newEvent._id});
    });

    /**
     * Changes event data.
     * Input Schema:
     * {
     *  "eventName": string, // Optional, name of the event
     *  "location": string, // Optional, location of the event
     *  "maxPlayers": number, // Optional, maximum allowed players
     *  "dateTime": number // Optional, date-time for the event
     * }
     */
    app.put('/api/event/:id', async (req, res) => {
        const body = req.body;

        if(!await eventModel.findOne({"_id": req.params.id})) {
            await res.send({"error": "No such event."});
            return;
        }

        await eventModel.findOneAndUpdate({
            "_id": req.params.id
        }, {
            "eventName": body.eventName,
            "location": body.location,
            "maxPlayers": body.maxPlayers,
            "dateTime": body.dateTime
        });

        await res.send({});
    });

    app.delete('/api/event/:id', async (req, res) => {
        if(!await eventModel.findOne({"_id": req.params.id})) {
            await res.send({"error": "No such event."});
            return;
        }
        
        await eventModel.deleteOne({"_id": req.params.id});
        await res.send({});
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