import express from 'express';
import {eventModel} from "../index.js";
import { isID } from "../index.js";

/**
 * @param {express.Express} app 
 */
export function eventEndpoints(app) {

    app.get('/api/event', async (req, res) => {
        //Get all events
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

        res.send(resultsModified);
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
    app.post('/api/event/', async (req, res) => {
        //Create event
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
            "eventName": body.eventName,
            "location": body.location,
            "playerNum": 0,
            "maxPlayers": body.maxPlayers,
            "dateTime": body.dateTime,
            "ownerID": 999999,
            "brackets": []
        });
        await newEvent.save();
        console.log(newEvent._id);
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
        //Modify Event
        const body = req.body;
        let id = req.params.id;

        if(isID(id) && await eventModel.findOne({"_id": id})) {
            await eventModel.findOneAndUpdate({
                "_id": id
            }, {
                "eventName": body.eventName,
                "location": body.location,
                "maxPlayers": body.maxPlayers,
                "dateTime": body.dateTime
            });
            res.send("Event updated");            
        }
        else{
            res.send({"error": "No such event."});
            return;
        }        
    });

    app.delete('/api/event/:id', async (req, res) => {
        //Delete an event
        let id = req.params.id;
        if(isID(id) && await eventModel.findOne({"_id": id})) {
            await eventModel.deleteOne({"_id": id});
            res.send({});
        }
        else{
            res.send({"error": "No such event."});
            return;
        }
    });

    app.get('/api/event/:id', async (req, res) => {
        //Get event details
        let id = req.params.id;
        if(isID(id) && await eventModel.findOne({"_id": id})){
            let result = await eventModel.findOne({"_id": id});
            res.send(result);
        }
        else{
            res.send({"error": "No such event."});
            return;
        }
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

    // app.post('/api/event/:id/decks', (req, res) => {
    //     res.send('Add Deck to Event');
    // });

    // app.delete('/api/event/:id/decks', (req, res) => {
    //     res.send('Remove Deck from Event');
    // });

    // app.get('/api/event/:id/decks', (req, res) => {
    //     res.send('View Decks from Event Library');
    // });

    // app.get('/api/event/:id/bannedCards', (req, res) => {
    //     res.send('View Banned Cards');
    // });

    // app.post('/api/event/:id/bannedCards', (req, res) => {
    //     res.send('Add Banned Card');
    // });

    // app.delete('/api/event/:id/bannedCards', (req, res) => {
    //     res.send('Unban Card');
    // });
}