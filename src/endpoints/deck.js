import express from 'express';
import * as mongoose from 'mongoose';
import { deckModel } from '../index.js';


/**
 * @param {express.Express} app 
 */
export function deckEndpoints(app) {
    app.get('/api/card/url', async(req, res) => {
        res.status(200);
        res.send({'message':'Get Card Image'});
        
    });

    app.post('/api/deck', async(req, res) => {
        //Create Deck
        let deckName = req.body.deckName;
        let cards = req.body.cards;
        let user = req.body.user;
        let deckWins = req.body.deckWins;
        let deckLosses  = req.body.deckLosses;

        const newDeck = new deckModel({
            deckName,
            cards,
            user,
            deckWins,
            deckLosses
        });

        try {
            await newDeck.save();
            res.status(201);
            await res.send({'message':'Deck created.'});
        } catch {
            console.log('Error creating new deck');
            res.status(400);
            await res.send({'error':'An error occurred.'});
        }
    });

    app.post('/api/deck/:id/cards', async(req, res) => {
        //Add card to Deck
        let deckId = req.params.id;
        let cardName = req.body.cardName;
        let cardImage = req.body.cardImage;
        let cardFormats = req.body.cardFormats;
        let cardData = req.body.cardData;
    
        try {
            const deck = await deckModel.findById(deckId);
    
            if (!deck) {
                res.status(400);
                return res.send({'error':'Deck not found.'});
            }

            const newCard = { 
                 cardName,
                 cardImage, 
                 cardFormats, 
                 cardData 
                };

            deck.cards.push(newCard);
    
            await deck.save();
            res.status(200);
            await res.send({'message':'Card added to deck.'});
        } catch (e) {
            console.log('Error adding card to deck:', e);
            res.status(400)
            await res.send({'error':'An error occurred.'});
        }
    });

    app.delete('/api/deck/:id/cards', async(req, res) => {
        //Remove Card from Deck
        let deckId = req.params.ObjectID;
        let cardName = req.body.cardName;  // remove by name or uri? discuss?
    
        try {
            const deck = await deckModel.findById(deckId);
    
            if (!deck) {
                res.status(400);
                return res.send({'error':'Deck not found.'});
            }
    
            deck.cards = deck.cards.filter(card => card.cardName !== cardName);
    
            await deck.save();
            res.status(200);
            await res.send({'message':'Card removed from deck.'});
        } catch (e) {
            console.log('Error removing card from deck:', e);
            res.status(400);
            await res.send({'error':'An error occurred.'});
        }
    });

    app.get('/api/deck/:id', async(req, res) => {
        //View Deck
        let deckId = req.params.ObjectID;

        try {
            const deck = await deckModel.findById(deckId);
    
            if (!deck) {
                res.status(400);
                return res.send({'error':'Deck not found.'});
            }
    
            res.status(200);
            await res.send({'message':'returning Deck',
                'data': deck }); 
        } catch (e) {
            console.log('Error fetching deck:', e);
            res.status(400);
            await res.send({'error':'An error occurred.'});
        }
    });

    app.get('/api/deck/:id/winRate', async(req, res) => {
        //View Deck Win Rate
        let deckId = req.params.ObjectID;

    try {
        const deck = await deckModel.findById(deckId);

        if (!deck) {
            res.status(400);
            return res.send({'error':'Deck not found.'});
        }
        const totalGames = deck.deckWins + deck.deckLosses;
        const winRate = totalGames > 0 ? (deck.deckWins / totalGames) * 100 : 0;

        res.status(200);
        await res.send({'message':'Deck WinRateFound',
            'data':`Deck win rate: ${winRate.toFixed(2)}%`});
    } catch (e) {
        console.log('Error calculating win rate:', e);
        res.status(400);
        await res.send({'error':'An error occurred.'});
    }
    });

    app.get('/api/card/legality', async(req, res) => { 
        // how are we doing legality? In relation to events? That would be more deck legality vs card legality
        // discuss better legality handling for events, decks, and cards
        res.status(200);
        res.send('Check Card Legality');
        
    });
}