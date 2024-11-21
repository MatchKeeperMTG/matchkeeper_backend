import express from 'express';
import {eventModel, userProfileModel} from "../index.js";
import { isID } from "../index.js";
import * as mongoose from 'mongoose';
import { authMiddleware } from './user.js';

/**
 * @param {express.Express} app 
 */
export function eventEndpoints(app) {

    app.get('/api/event', authMiddleware, async (req, res) => {
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
    app.post('/api/event/', authMiddleware, async (req, res) => {
        //Create event
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
            "owner": req.user,
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
    app.put('/api/event/:id', authMiddleware, async (req, res) => {
        //Modify Event -- Add check for if eventName exists
        const body = req.body;
        let id = req.params.id;

        if(isID(id) && await eventModel.findById(id)) {
            let event = await eventModel.findById(id);
            if (!event.owner.equals(req.user)){
                res.status(401);
                res.send({"error": "Not authorized to edit event"});
                return;
            }

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

    app.delete('/api/event/:id', authMiddleware, async (req, res) => {
        //Delete an event
        let id = req.params.id;
        if(isID(id) && await eventModel.findOne({"_id": id})) {
            let event = await eventModel.findById(id);
            if (!event.owner.equals(req.user)){
                res.status(401);
                res.send({"error": "Not authorized to edit event"});
                return;
            }
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

    app.get('/api/event/:id', authMiddleware, async (req, res) => {
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

    app.get('/api/event/:id/players', authMiddleware, async (req, res) => {
        //Get players in event
        let id = req.params.id;
        if(isID(id) && await eventModel.findById(id)){
            let event = await eventModel.findById(id);
            let eventPlayers = event.attendees;
            let ret = [];
            let playerList = [];
            let flag = false;
            for (const playerId of eventPlayers){
                const query = await userProfileModel.findById(playerId);
                if (query){
                    ret.push(query.username);
                    playerList.push(query.username);
                }
                else{
                    ret.push({"error": "Player " + playerId + "not found!"});
                    flag = true;
                }
            }
            if(flag){
                let removeEvent = await eventModel.findOneAndUpdate(
                    {_id: id},
                    {attendees: playerList},
                    {safe: true, multi: false}
                );
                removeEvent.save();
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

    app.post('/api/event/:id/players', authMiddleware, async (req, res) => {
        //Add player(s) to event
        let id = req.params.id;
        let count = 0;
        //If event exists:
        if(isID(id) && await eventModel.findOne({"_id": id})){
            let event = await eventModel.findOne({"_id": id});
            if (!event.owner.equals(req.user)){
                res.status(401);
                res.send({"error": "Not authorized to edit event"});
                return;
            }
            let eventPlayers = event.attendees;
            count = event.playerNum;
            //Loops through each player inputted:
            for (const player of req.body.players){
                const query = userProfileModel.where({"username": player});
                const playerQuery = await query.findOne();
                //If player exists:
                if (playerQuery){
                    if (eventPlayers.includes(playerQuery._id)){
                        console.log("Player ", player, " already in event");
                    }
                    else if (count == event.maxPlayers){
                        console.log("Event full!");
                        res.status(400);
                        res.send({"error": "Too many players!"});
                        return;
                    }
                    else{
                        event.attendees.push(playerQuery._id);
                        count++;
                        console.log("Player ", player, " added to event!");
                    }
                }
                else{
                    console.log("Player ", player, " not found!");
                }
            }
            event.playerNum = count;
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
            let event = await eventModel.findOne({"_id": id});
            if (!event.owner.equals(req.user)){
                res.status(401);
                res.send({"error": "Not authorized to edit event"});
                return;
            }
            const newPlayerList = [];
            const query = userProfileModel.where({"username": req.body.username});
            const playerQuery = await query.findOne();
            if(playerQuery){
                let playerId = playerQuery._id;
                for(const player of event.attendees){
                    if (!player.equals(playerId)){
                        newPlayerList.push(player);
                    }
                }
                event.attendees = newPlayerList;
                event.playerNum = newPlayerList.length;
                event.save();
                res.status(200);
                res.send({'message':'removed player from attendees',
                        'data':event.attendees});
                return;
            }else{
                res.status(400);
                res.send({"error":"Player not in event"});
                return;
            }
        }
        else{
            res.status(400);
            res.send({"error": "event does not exist"});
            return;
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