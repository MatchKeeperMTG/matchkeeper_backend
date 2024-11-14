import express from 'express';
import * as mongoose from "mongoose";
import {isID} from "../index.js";
import {bracketModel} from '../index.js';
import { userProfileModel } from '../index.js';

/**
 * @param {express.Express} app 
 */
export function bracketEndpoints(app) {

    //Create Bracket
    app.post('/api/bracket', async (req, res) => {

        let bracketStyle = req.body.bracketStyle;
        let gameFormat = req.body.gameFormat;
        let playerNum = req.body.playerNum;
        let maxPlayers = req.body.maxPlayers;
        let players = [];

        const newBracket = new bracketModel({
            bracketStyle : bracketStyle,
            gameFormat : gameFormat,
            playerNum : playerNum,
            maxPlayers : maxPlayers,
            players : players
        });


        try{
            await newBracket.save();
            await res.send('New Bracket Created');
        }
        catch{
            console.log('Failed Bracket Creation');
            await res.send('Failed Bracket creation');
        }

        
    });

    //Edit Bracket
    app.post('/api/bracket/:id', async (req, res) => {

    
        //check to make sure the ID is valid and the bracket object exists
        let id = req.params.id;
        if(isID(id) && await bracketModel.findOne({"_id":id})){
            let bracketStyle = req.body.bracketStyle;
            let gameFormat = req.body.gameFormat;
            let playerNum = req.body.playerNum;
            let maxPlayers = req.body.maxPlayers;
            

            let query = {'_id': id};

            let newInfo = {'bracketStyle': bracketStyle, 'gameFormat': gameFormat,
             'playerNum': playerNum, 'maxPlayers': maxPlayers};
            
            await bracketModel.findOneAndUpdate(query, newInfo, {upsert:false} );


            res.send('Edit Bracket');
            return;

            
        }

        //if there is an error
        console.log('Failed Bracket Edit');
        await res.send('Failed Bracket Edit');
        
        
    });


    //Delete Bracket
    app.delete('/api/bracket/:id', async (req, res) => {
        let id = req.params.id;
        if(isID(id) && await bracketModel.findOne({"_id":id})){
            await bracketModel.findByIdAndDelete({"_id":id});
            res.send("Bracket deleted!");
        }
        else
        {
            res.send("Bracket not found");
        }
    });

    //Add Player to bracket
    app.post('/api/bracket/:id/players', async (req, res) => {
        
        //check to make sure the ID is valid and the bracket object exists
        let id = req.params.id;
        if(isID(id) && await bracketModel.findOne({"_id":id}))
        {
            let inputBracket = await bracketModel.findById({"_id": id});
            let players = inputBracket.players;
            let playerToAdd = req.body.playerID;

            //validate userID sent
            if(!(isID(id) && await userProfileModel.findOne({"_id":playerToAdd})))
            {
                res.send("invalid PlayerID sent");
                return;
            }

            //check to see if the bracket is at maximum capacity
            if(inputBracket.maxPlayers == inputBracket.playerNum)
            {
                res.send("Bracket is at maximum capacity");
                return;
            }

            //check to see if the player is already in the bracket
            for(const player of players)
            {
                if(player._id == playerToAdd)
                {
                    console.log("User is already in bracket");
                    res.send("User is already in bracket");
                    return;
                }
                
            }

            //if they are not add them to it
            let newPlayer = await userProfileModel.findById({"_id": playerToAdd});
            inputBracket.players.push(newPlayer);
            inputBracket.playerNum += 1;

            //save the data and exit
            inputBracket.save();
            res.send("Player added to bracket");
            return;

        }
        
        res.send('Failed to add player');

    });

    //Remove Player from bracket
    app.delete('/api/bracket/:id/players', async (req, res) => {

        //check to make sure the ID is valid and the bracket object exists
        let id = req.params.id;
        if(isID(id) && await bracketModel.findOne({"_id":id}))
        {
            let inputBracket = await bracketModel.findById({"_id": id});
            let players = inputBracket.players;
            let playerToAdd = req.body.playerID;

            //validate userID sent
            if(!(isID(id) && await userProfileModel.findOne({"_id":playerToAdd})))
            {
                res.send("invalid PlayerID sent");
                return;
            }


            //find player in bracket
            for(const player of players)
            {
                //if found remove them
                if(player._id == playerToAdd)
                {
                    inputBracket.players.remove(player);
                    inputBracket.playerNum -= 1;
                    //save the data and exit
                    inputBracket.save();
                    res.send("Player removed from bracket");
                    return;
                }
                
            }

            res.send("Player not in bracket");
            return;


            

        }
        res.send('Bracket not found');
    });

    //Set Results of the bracket
    app.post('/api/bracket/:id/results', async (req, res) => {
        
        let id = req.params.id;
        if(isID(id) && await bracketModel.findOne({"_id":id}))
        {
            let playerUsernames = req.body.playerUsernames;
            let wins = req.body.wins;
            let losses = req.body.losses;

            //create a loop to edit all users wins and losses
            let counter = 0;
            for(const player in playerUsernames)
            {
                //verify that the player with that username exists
                if(!(await userProfileModel.findOne({"username":playerUsernames[player]})))
                {
                    res.status(400);
                    res.send({"error":"invalid playerUsername sent"});
                    return;
                }

                //update that persons wins
                let playerObject = await userProfileModel.findOne({"username":playerUsernames[player]});
                playerObject.wins += wins[counter];
                playerObject.losses += losses[counter];

                //save the result
                try{
                    playerObject.save();
                }
                catch{
                    res.status(500);
                    res.send({"error" :" error saving Player Data"})
                }
                
                //increment the counter for wins and losses lists
                counter++;
            }

            res.send("results updated");
            return;
        }

        res.send("bracket not found");
    });
}