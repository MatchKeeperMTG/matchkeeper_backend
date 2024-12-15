import express from 'express';
import * as mongoose from "mongoose";
import {eventModel, isID} from "../index.js";
import {bracketModel} from '../index.js';
import { userProfileModel } from '../index.js';
import { authMiddleware } from './user.js';

/**
 * @param {express.Express} app 
 */
export function bracketEndpoints(app) {

    //Create Bracket
    app.post('/api/bracket', authMiddleware, async (req, res) => {
        let user = req.user;
        let eventID = req.body.event;

        let event = await eventModel.findById(eventID);
        if (!(isID(eventID) && await eventModel.findById(eventID))){
            res.status(400);
            res.send({"error": "Event not valid"});
            return;
        }

        if (!event.owner.equals(user)){
            res.status(401);
            res.send({"error": "Not authorized to edit event"});
            return;
        }

        const newBracket = new bracketModel({
            bracketStyle : req.body.bracketStyle,
            gameFormat : req.body.gameFormat,
            playerNum : req.body.playerNum,
            maxPlayers : req.body.maxPlayers,
            players : []
        });

        try{
            await newBracket.save();
            event.bracket.push(newBracket._id);
            await event.save();
            res.status(201);
            res.send({'message':'Returning bracket ID:', 'data':newBracket._id});
        }
        catch{
            res.status(400);
            console.log('Failed Bracket Creation');
            res.send({'error':'Failed Bracket creation'});
        }

        
    });

    //Edit Bracket
    app.post('/api/bracket/:id', authMiddleware, async (req, res) => {
        //check to make sure the ID is valid and the bracket object exists
        let id = req.params.id;
        let user = req.user;
        if(isID(id) && await bracketModel.findOne({'_id':id})){
            let event = await eventModel.findOne({
                bracket: { $in: [id]}
            })
            console.log(event);

            if (!event || !event.owner.equals(user)){
                res.status(401);
                res.send({"error": "Cannot edit this bracket"});
                return;
            }

            let bracketStyle = req.body.bracketStyle;
            let gameFormat = req.body.gameFormat;
            let playerNum = req.body.playerNum;
            let maxPlayers = req.body.maxPlayers;
            let query = {'_id': id};

            let newInfo = {'bracketStyle': bracketStyle, 'gameFormat': gameFormat,
             'playerNum': playerNum, 'maxPlayers': maxPlayers};
            await bracketModel.findOneAndUpdate(query, newInfo, {upsert:false} );

            res.status(200);
            res.send({'message':'Edit Bracket'});
            return;
        }

        //if there is an error
        res.status(400);
        console.log('Failed Bracket Edit');
        await res.send({'error':'Failed Bracket Edit'});
        
        
    });


    //Delete Bracket
    app.delete('/api/bracket/:id', authMiddleware, async (req, res) => {
        let id = req.params.id;
        let user = req.user;
        if(isID(id) && await bracketModel.findOne({'_id':id})){
            let event = await eventModel.findOne({bracket: { $in: [id]}});
            if (!event.owner.equals(user)){
                res.status(401);
                res.send({"error": "not authorized to delete bracket"});
                return;
            }

            await bracketModel.findByIdAndDelete({'_id':id});
            res.status(200);
            res.send({});
            return;
        }
        else
        {
            res.status(400);
            res.send({'error':'Bracket not found'});
        }
    });

    //Add Player to bracket
    app.post('/api/bracket/:id/players', authMiddleware, async (req, res) => {
        //check to make sure the ID is valid and the bracket object exists
        let id = req.params.id;
        let user = req.user;
        if(isID(id) && await bracketModel.findOne({'_id':id}))
        {
            let event = await eventModel.findOne({bracket: { $in: [id]}});
            console.log(event);
            if (!event.owner.equals(user)){
                res.status(401);
                res.send({"error": "not authorized"});
                return;
            }

            let inputBracket = await bracketModel.findById(id);
            let players = inputBracket.players;
            let playerToAdd = req.body.playerUsername;

            //validate userID sent
            if(!(isID(id) && await userProfileModel.findOne({'username':playerToAdd})))
            {
                res.status(400);
                res.send({'error':'invalid PlayerID sent'});
                return;
            }

            let playerModel = await userProfileModel.findOne({'username': playerToAdd});

            //check to see if the bracket is at maximum capacity
            if(inputBracket.maxPlayers == inputBracket.playerNum)
            {
                res.status(400);
                res.send({'error':'Bracket is at maximum capacity'});
                return;
            }

            //check to see if the player is already in the bracket
            for(const player of players)
            {
                if(player.equals(playerModel._id))
                {
                    console.log('User is already in bracket');
                    res.status(400);
                    res.send({'error':'User is already in bracket'});
                    return;
                }
                
            }
            //if they are not add them to it
            inputBracket.players.push(playerModel._id);
            inputBracket.playerNum += 1;

            //save the data and exit
            inputBracket.save();
            res.status(200);
            res.send({'message':'Player added to bracket'});
            return;
        }
        res.status(400);
        res.send({'error':'Failed to add player'});
    });

    //Remove Player from bracket
    app.delete('/api/bracket/:id/players', authMiddleware, async (req, res) => {

        //check to make sure the ID is valid and the bracket object exists
        let id = req.params.id;
        let user = req.user;
        if(isID(id) && await bracketModel.findOne({'_id':id}))
        {
            let event = await eventModel.findOne({bracket: { $in: [id]}});
            if (!event.owner.equals(user)){
                res.status(401);
                res.send({"error": "not authorized"});
                return;
            }
            let inputBracket = await bracketModel.findById({'_id': id});
            let players = inputBracket.players;
            let playerToAdd = req.body.playerID;

            //validate userID sent
            if(!(isID(id) && await userProfileModel.findOne({'_id':playerToAdd})))
            {
                res.status(400);
                res.send({'error':'invalid PlayerID sent'});
                return;
            }

            //find player in bracket
            for(const player of players)
            {
                //if found remove them
                if(player._id.equals(playerToAdd))
                {
                    inputBracket.players.remove(player);
                    inputBracket.playerNum -= 1;
                    //save the data and exit
                    inputBracket.save();
                    res.status(200);
                    res.send({'message':'Player removed from bracket'});
                    return;
                }
                
            }
            res.status(400);
            res.send({'error':'Player not in bracket'});
            return;
        }
        res.status(400);
        res.send({'error':'Bracket not found'});
    });

    //Set Results of the bracket
    app.post('/api/bracket/:id/results', authMiddleware, async (req, res) => {
        let id = req.params.id;
        let user = req.user;
        if(isID(id) && await bracketModel.findOne({'_id':id}))
        {
            let bracket = await bracketModel.findById(id);
            let event = await eventModel.findOne({bracket: { $in: [id]}});
            if (!event.owner.equals(user)){
                res.status(401);
                res.send({"error": "not authorized"});
                return;
            }
            let playerUsernames = req.body.playerUsernames;
            let wins = req.body.wins;
            let losses = req.body.losses;

            //create a loop to edit all users wins and losses
            let counter = 0;
            for(const player in playerUsernames)
            {
                //verify that the player with that username exists
                if(!(await userProfileModel.findOne({'username':playerUsernames[player]})))
                {
                    res.status(400);
                    res.send({'error':'invalid playerUsername sent'});
                    return;
                }

                //update that persons wins
                let playerObject = await userProfileModel.findOne({'username':playerUsernames[player]});
                if (!bracket.players.includes(playerObject._id)){
                    res.status(400);
                    res.send({"error": "player not in event"});
                    return;
                }

                playerObject.wins += wins[counter];
                playerObject.losses += losses[counter];

                //save the result
                try{
                    playerObject.save();
                }
                catch{
                    res.status(500);
                    res.send({'error' :'error saving Player Data'})
                }
                
                //increment the counter for wins and losses lists
                counter++;
            }

            res.status(200);
            res.send({'message':'results updated'});
            return;
        }

        res.status(500)
        res.send({'error':'bracket not found'});
    });

    //Get all bracket info
    app.get('/api/bracket/:id', authMiddleware, async(req, res) =>{
        let user = req.user;
        let id = req.params.id;

        if(isID(id) && await bracketModel.findById(id)){
            let players = [];
            let bracket = await bracketModel.findById(id);
            let event = await eventModel.findOne({bracket: { $in: [id]}});

            for (const playerID of bracket.players){
                let player = await userProfileModel.findById(playerID);
                players.push(player.username);
            }

            res.status(200);
            res.send({
                "eventName": event.eventName,
                "bracketStyle": bracket.bracketStyle,
                "gameFormat": bracket.gameFormat,
                "playerNum": bracket.playerNum,
                "maxPlayers": bracket.maxPlayers,
                "players": players
            });
            return;
        }
        else{
            res.status(400);
            res.send({"error": "bracket not found"});
        }


    });
}