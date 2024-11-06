import express from 'express';
import {bracketModel} from '../index.js';

/**
 * @param {express.Express} app 
 */
export function bracketEndpoints(app) {
    app.post('/api/bracket', async (req, res) => {
        console.log(req.body);

        //this is the schema for my reference atm
        // const bracketSchema = new mongoose.Schema({ 
        //     bracketStyle : String,
        //     gameFormat : String,
        //     playerNum : Number,
        //     maxPlayers : Number,
        //     players : [userProfileSchema],

        let bracketStyle = req.body.bracketStyle;
        let gameFormat = req.body.gameFormat;
        let playerNum = req.body.playerNum;
        let maxPlayers = req.body.maxPlayers;
        let players = req.body.players;

        

        const newBracket = new BracketModel({
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

    app.post('/api/bracket/:id', (req, res) => {
        res.send('Edit Bracket');
    });

    app.delete('/api/bracket/:id', (req, res) => {
        res.send('Delete Bracket');
    });

    app.post('/api/bracket/:id/results', (req, res) => {
        res.send('Set Win');
    });
}