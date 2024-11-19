import express from 'express';
import {eventModel, userProfileModel} from "../index.js";
import { isID } from "../index.js";
import * as mongoose from 'mongoose';

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

        res.status(200);
        res.send({'message': 'returning all events',
            'data':resultsModified});
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
        //Create event -- Add check if eventName exists
        const body = req.body;      

        if(body.eventName === undefined) {
            res.status(400);
            res.send({"error": "'name' field not specified."});
            return;
        }

        let queryName = eventModel.where({"eventName": body.eventName});
        if (await queryName.countDocuments() > 0){
            res.status(400);
            res.send({"error": "Event name already exists"});
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
        res.status(200);
        res.send({'message': 'returning Event ID',
            'data':{"id": newEvent._id}});
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
        //Modify Event -- Add check for if eventName exists
        const body = req.body;
        let id = req.params.id;

        if(isID(id) && await eventModel.findById(id)) {

            let queryName = eventModel.where({"eventName": body.eventName});
            if (await queryName.countDocuments() > 0){
                res.status(400);
                res.send({"error": "Event name already exists"});
                return;
            }

            await eventModel.findOneAndUpdate({
                "_id": id
            }, {
                "eventName": body.eventName,
                "location": body.location,
                "maxPlayers": body.maxPlayers,
                "dateTime": body.dateTime
            });
            res.status(200);
            res.send({"message":"Event updated"});            
        }
        else{
            res.status(400);
            res.send({"error": "No such event."});
            return;
        }        
    });

    app.delete('/api/event/:id', async (req, res) => {
        //Delete an event
        let id = req.params.id;
        if(isID(id) && await eventModel.findOne({"_id": id})) {
            await eventModel.deleteOne({"_id": id});
            res.status(200);
            res.send({"message":"event deleted"});
        }
        else{
            res.status(400);
            res.send({"error": "No such event."});
            return;
        }
    });

    app.get('/api/event/:id', async (req, res) => {
        //Get event details
        let id = req.params.id;
        if(isID(id) && await eventModel.findOne({"_id": id})){
            let result = await eventModel.findOne({"_id": id});
            res.status(200);
            res.send({'message':'returning result',
                'data':result});
        }
        else{
            res.status(400);
            res.send({"error": "No such event."});
            return;
        }
    });

    app.get('/api/event/:id/players', async (req, res) => {
        //Get players in event
        let id = req.params.id;
        if(isID(id) && await eventModel.findById(id)){
            let event = await eventModel.findById(id);
            let eventPlayers = event.attendees;
            let ret = [];
            for (const playerId of eventPlayers){
                const query = await userProfileModel.findById(playerId);
                if (query){
                    ret.push(query.username);
                }
                else{
                    //let string = "Player " +  playerId + " not found";
                    ret.push({"error": "Player " + playerId + "not found!"});
                    console.log("Player ", playerId, " not found!");
                    let removeEvent = await eventModel.findOneAndUpdate(
                        {_id: id},
                        {$pull: {attendees: {playerId}}},
                        {safe: true, multi: false}
                    );
                    removeEvent.save();
                }
            }
            res.status(200);
            res.send({'message':'returning players in event',
                'data':ret});
        }
        else{
            res.status(400);
            res.send({"error": "event does not exist"});
        }
    });

    app.post('/api/event/:id/players', async (req, res) => {
        //Add player(s) to event
        let id = req.params.id;
        //If event exists:
        if(isID(id) && await eventModel.findOne({"_id": id})){
            let event = await eventModel.findOne({"_id": id});
            let eventPlayers = event.attendees;
            //Loops through each player inputted:
            for (const player of req.body.players){
                const query = userProfileModel.where({"username": player});
                const playerQuery = await query.findOne();
                //If player exists:
                if (playerQuery){
                    if (eventPlayers.includes(playerQuery._id)){
                        console.log("Player ", player, " already in event");
                    }
                    else{
                        event.attendees.push(playerQuery._id);
                        console.log("Player ", player, " added to event!");
                    }
                }
                else{
                    console.log("Player ", player, " not found!");
                }
            }
            event.save();
            res.status(200);
            res.send({"message":"Added players to events"});
        }
        else{
            res.status(400);
            res.send({"error": "Event does not exist"});
            return;
        }
    });

    app.delete('/api/event/:id/players', async (req, res) => {
        //Remove player from event
        let id = req.params.id;
        if(isID(id) && await eventModel.findOne({"_id": id})){
            let event = eventModel.findOne({"_id": id});
            let players = event.attendees;
            
            const query = userProfileModel.where({"username": req.body.username});
            const playerQuery = await query.findOne();
            if(playerQuery){
                let playerId = playerQuery._id;
                let index = players.indexOf(playerId);
                if (index > -1){
                    players.splice(index, 1);
                    event.attendees = players;
                    event.save();
                }
                res.status(200);
                res.send({'message':'removed player from attendees',
                    'data':event.attendees});
            }else{
                res.status(400);
                res.send({"error":"Player not in event"});
            }
        }
        else{
            res.status(400);
            res.send({"error": "event does not exist"});
        }

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