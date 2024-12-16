import express from 'express';
import * as mongoose from "mongoose";
import { eventModel, isID } from "../index.js";
import { bracketModel } from '../index.js';
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
        if (!(isID(eventID) && await eventModel.findById(eventID))) {
            res.status(400);
            res.send({ "error": "Event not valid" });
            return;
        }

        if (!event.owner.equals(user)) {
            res.status(401);
            res.send({ "error": "Not authorized to edit event" });
            return;
        }

        const newBracket = new bracketModel({
            bracketStyle: req.body.bracketStyle,
            gameFormat: req.body.gameFormat,
            playerNum: 0,
            maxPlayers: req.body.maxPlayers,
            players: [],
            finishedMatchups: [],
            eliminatedPlayers: []
        });

        try {
            await newBracket.save();
            event.bracket = newBracket._id;
            await event.save();
            res.status(201);
            res.send({ 'id': newBracket._id });
        }
        catch {
            res.status(400);
            console.log('Failed Bracket Creation');
            res.send({ 'error': 'Failed Bracket creation' });
        }


    });

    //Edit Bracket
    app.post('/api/bracket/:id', authMiddleware, async (req, res) => {
        //check to make sure the ID is valid and the bracket object exists
        let id = req.params.id;
        let user = req.user;
        if (isID(id) && await bracketModel.findOne({ '_id': id })) {
            let event = await eventModel.findOne({
                bracket: { $in: [id] }
            })
            console.log(event);

            if (!event || !event.owner.equals(user)) {
                res.status(401);
                res.send({ "error": "Cannot edit this bracket" });
                return;
            }

            let bracketStyle = req.body.bracketStyle;
            let gameFormat = req.body.gameFormat;
            let maxPlayers = req.body.maxPlayers;
            let query = { '_id': id };

            let newInfo = { 'bracketStyle': bracketStyle, 'gameFormat': gameFormat, 'maxPlayers': maxPlayers };
            await bracketModel.findOneAndUpdate(query, newInfo, { upsert: false });

            res.status(200);
            res.send({ 'message': 'Edit Bracket' });
            return;
        }

        //if there is an error
        res.status(400);
        console.log('Failed Bracket Edit');
        await res.send({ 'error': 'Failed Bracket Edit' });


    });


    //Delete Bracket
    app.delete('/api/bracket/:id', authMiddleware, async (req, res) => {
        let id = req.params.id;
        let user = req.user;
        if (isID(id) && await bracketModel.findOne({ '_id': id })) {
            let event = await eventModel.findOne({ bracket: { $in: [id] } });
            if (!event.owner.equals(user)) {
                res.status(401);
                res.send({ "error": "not authorized to delete bracket" });
                return;
            }

            await bracketModel.findByIdAndDelete({ '_id': id });
            res.status(200);
            res.send({});
            return;
        }
        else {
            res.status(400);
            res.send({ 'error': 'Bracket not found' });
        }
    });

    //Add Player to bracket
    app.post('/api/bracket/:id/players', authMiddleware, async (req, res) => {
        //check to make sure the ID is valid and the bracket object exists
        let id = req.params.id;
        let user = req.user;
        if (isID(id) && await bracketModel.findOne({ '_id': id })) {
            let event = await eventModel.findOne({ bracket: { $in: [id] } });
            console.log(event);
            if (!event.owner.equals(user)) {
                res.status(401);
                res.send({ "error": "not authorized" });
                return;
            }

            let inputBracket = await bracketModel.findById(id);
            let players = inputBracket.players;
            let playerToAdd = req.body.playerUsername;

            //validate userID sent
            if (!(isID(id) && await userProfileModel.findOne({ 'username': playerToAdd }))) {
                res.status(400);
                res.send({ 'error': 'invalid PlayerID sent' });
                return;
            }

            let playerModel = await userProfileModel.findOne({ 'username': playerToAdd });

            //check to see if the bracket is at maximum capacity
            if (inputBracket.maxPlayers == inputBracket.playerNum) {
                res.status(400);
                res.send({ 'error': 'Bracket is at maximum capacity' });
                return;
            }

            //check to see if the player is already in the bracket
            for (const player of players) {
                if (player.equals(playerModel._id)) {
                    console.log('User is already in bracket');
                    res.status(400);
                    res.send({ 'error': 'User is already in bracket' });
                    return;
                }

            }
            //if they are not add them to it
            inputBracket.players.push(playerModel._id);
            inputBracket.playerNum += 1;

            //save the data and exit
            inputBracket.save();
            res.status(200);
            res.send({ 'message': 'Player added to bracket' });
            return;
        }
        res.status(400);
        res.send({ 'error': 'Failed to add player' });
    });

    app.get('/api/bracket/:id/matchups', async (req, res) => {
        let id = req.params.id;

        if (!(isID(id) && await bracketModel.findById(id))) {
            res.status(400);
            res.send({ "error": "Invalid bracket ID" });
            return;
        }

        const bracket = await bracketModel.findById(id);

        // Get active players (not eliminated)
        const activePlayers = bracket.players.filter(player =>
            !bracket.eliminatedPlayers.some(ep => ep.equals(player))
        );

        // Sort by _id to ensure deterministic ordering
        activePlayers.sort((a, b) => a.toString().localeCompare(b.toString()));

        const matchups = [];
        const round = bracket.finishedMatchups.length > 0
            ? Math.max(...bracket.finishedMatchups.map(m => m.round)) + 1
            : 1;

        // Generate pairs of players
        for (let i = 0; i < activePlayers.length - 1; i += 2) {
            if (i + 1 < activePlayers.length) {
                matchups.push({
                    player1: activePlayers[i],
                    player2: activePlayers[i + 1],
                    round: round
                });
            }
        }

        // Handle odd number of players - last player gets a bye
        if (activePlayers.length % 2 !== 0 && activePlayers.length > 0) {
            matchups.push({
                player1: activePlayers[activePlayers.length - 1],
                player2: null,
                round: round
            });
        }

        res.status(200);
        res.send({
            round: round,
            matchups: matchups
        });
    });

    app.get('/api/bracket/:id/completedMatchups', async (req, res) => {
        let id = req.params.id;

        if (!(isID(id) && await bracketModel.findById(id))) {
            res.status(400);
            res.send({ "error": "Invalid bracket ID" });
            return;
        }

        const bracket = await bracketModel.findById(id);

        // Group matchups by round
        const matchupsByRound = bracket.finishedMatchups.reduce((acc, matchup) => {
            if (!acc[matchup.round]) {
                acc[matchup.round] = [];
            }
            acc[matchup.round].push(matchup);
            return acc;
        }, {});

        res.status(200);
        res.send({
            rounds: matchupsByRound
        });
    });

    app.post('/api/bracket/:id/matchups/:round/:matchIndex/winner', authMiddleware, async (req, res) => {
        let id = req.params.id;
        let round = parseInt(req.params.round);
        let matchIndex = parseInt(req.params.matchIndex);
        let winnerId = req.body.winner;
    
        // Validate bracket exists
        if (!(isID(id) && await bracketModel.findById(id))) {
            res.status(400);
            res.send({ "error": "Invalid bracket ID" });
            return;
        }
    
        // Check if user owns the event
        const bracket = await bracketModel.findById(id);
        const event = await eventModel.findOne({ bracket: { $in: [id] } });
        
        if (!event || !event.owner.equals(req.user)) {
            res.status(401);
            res.send({ "error": "Not authorized to set match winner" });
            return;
        }
    
        // Get active players and current matchups
        const activePlayers = bracket.players.filter(player =>
            !bracket.eliminatedPlayers.some(ep => ep.equals(player))
        );
        activePlayers.sort((a, b) => a.toString().localeCompare(b.toString()));
    
        const matchups = [];
        for (let i = 0; i < activePlayers.length - 1; i += 2) {
            if (i + 1 < activePlayers.length) {
                matchups.push({
                    player1: activePlayers[i],
                    player2: activePlayers[i + 1],
                    round: round
                });
            }
        }
        if (activePlayers.length % 2 !== 0 && activePlayers.length > 0) {
            matchups.push({
                player1: activePlayers[activePlayers.length - 1],
                player2: null,
                round: round
            });
        }
    
        // Validate match index
        if (matchIndex < 0 || matchIndex >= matchups.length) {
            res.status(400);
            res.send({ "error": "Invalid match index" });
            return;
        }
    
        const match = matchups[matchIndex];
    
        // Validate winner is one of the players
        if (!match.player1.equals(winnerId) && (match.player2 && !match.player2.equals(winnerId))) {
            res.status(400);
            res.send({ "error": "Winner must be one of the match participants" });
            return;
        }
    
        // Add match to finished matchups
        bracket.finishedMatchups.push({
            player1: match.player1,
            player2: match.player2,
            winner: winnerId,
            round: round
        });
    
        // Add loser to eliminated players
        const loserId = match.player1.equals(winnerId) ? match.player2 : match.player1;
        if (loserId) {
            bracket.eliminatedPlayers.push(loserId);
        }
    
        await bracket.save();
    
        res.status(200);
        res.send({ "message": "Match winner set successfully" });
    });

    //Remove Player from bracket
    app.delete('/api/bracket/:id/players', authMiddleware, async (req, res) => {

        //check to make sure the ID is valid and the bracket object exists
        let id = req.params.id;
        let user = req.user;
        if (isID(id) && await bracketModel.findOne({ '_id': id })) {
            let event = await eventModel.findOne({ bracket: { $in: [id] } });
            if (!event.owner.equals(user)) {
                res.status(401);
                res.send({ "error": "not authorized" });
                return;
            }
            let inputBracket = await bracketModel.findById({ '_id': id });
            let players = inputBracket.players;
            let playerToAdd = req.body.playerID;

            //validate userID sent
            if (!(isID(id) && await userProfileModel.findOne({ '_id': playerToAdd }))) {
                res.status(400);
                res.send({ 'error': 'invalid PlayerID sent' });
                return;
            }

            // This would cause massive problems, so don't let it happen.
            if (inputBracket.finishedMatchups.length != 0) {
                res.status(400);
                res.send({ 'error': 'Cannot remove player from in-progress bracket.' });
                return;
            }

            //find player in bracket
            for (const player of players) {
                //if found remove them
                if (player._id.equals(playerToAdd)) {
                    inputBracket.players.remove(player);
                    inputBracket.playerNum -= 1;
                    //save the data and exit
                    inputBracket.save();
                    res.status(200);
                    res.send({ 'message': 'Player removed from bracket' });
                    return;
                }

            }
            res.status(400);
            res.send({ 'error': 'Player not in bracket' });
            return;
        }
        res.status(400);
        res.send({ 'error': 'Bracket not found' });
    });

    //Set Results of the bracket
    app.post('/api/bracket/:id/results', authMiddleware, async (req, res) => {
        let id = req.params.id;
        let user = req.user;
        if (isID(id) && await bracketModel.findOne({ '_id': id })) {
            let bracket = await bracketModel.findById(id);
            let event = await eventModel.findOne({ bracket: { $in: [id] } });
            if (!event.owner.equals(user)) {
                res.status(401);
                res.send({ "error": "not authorized" });
                return;
            }
        }

        res.status(500);
        res.send({ 'error': 'bracket not found' });
    });

    //Get all bracket info
    app.get('/api/bracket/:id', authMiddleware, async (req, res) => {
        let user = req.user;
        let id = req.params.id;

        if (isID(id) && await bracketModel.findById(id)) {
            let players = [];
            let bracket = await bracketModel.findById(id);
            let event = await eventModel.findOne({ bracket: { $in: [id] } });

            for (const playerID of bracket.players) {
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
        else {
            res.status(400);
            res.send({ "error": "bracket not found" });
        }


    });
}