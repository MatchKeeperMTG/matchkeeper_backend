import express from 'express';
import * as mongoose from 'mongoose';
import { deckModel } from '../index.js';


/**
 * @param {express.Express} app 
 */
export function deckEndpoints(app) {
    app.get('/api/card/url', async(req, res) => {
        res.send('Get Card Image');
        
    });

    app.post('/api/deck', async(req, res) => {
        res.send('Create Deck');
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
            await res.send('Deck created.');
        } catch {
            console.log('Error creating new deck');
            await res.send('An error occurred.');
        }
    });

    app.post('/api/deck/:id/cards', async(req, res) => {
        res.send('Add Card to Deck');
        let deckId = req.params.id;
        let cardName = req.body.cardName;
        let cardImage = req.body.cardImage;
        let cardFormats = req.body.cardFormats;
        let cardData = req.body.cardData;
    
        try {
            const deck = await deckModel.findById(deckId);
    
            if (!deck) {
                return res.send('Deck not found.');
            }

            const newCard = { 
                 cardName,
                 cardImage, 
                 cardFormats, 
                 cardData 
                };

            deck.cards.push(newCard);
    
            await deck.save();
            await res.send('Card added to deck.');
        } catch (e) {
            console.log('Error adding card to deck:', e);
            await res.send('An error occurred.');
        }
    });

    app.delete('/api/deck/:id/cards', async(req, res) => {
        res.send('Remove Card from Deck');
        let deckId = req.params.ObjectID;
        let cardName = req.body.cardName;  // remove by name or uri? discuss?
    
        try {
            const deck = await deckModel.findById(deckId);
    
            if (!deck) {
                return res.send('Deck not found.');
            }
    
            deck.cards = deck.cards.filter(card => card.cardName !== cardName);
    
            await deck.save();
            await res.send('Card removed from deck.');
        } catch (e) {
            console.log('Error removing card from deck:', e);
            await res.send('An error occurred.');
        }
    });

    app.get('/api/deck/:id', async(req, res) => {
        res.send('View Deck');
        let deckId = req.params.ObjectID;

        try {
            const deck = await deckModel.findById(deckId);
    
            if (!deck) {
                return res.send('Deck not found.');
            }
    
            await res.send({ deck }); 
        } catch (e) {
            console.log('Error fetching deck:', e);
            await res.send('An error occurred.');
        }
    });

    app.get('/api/deck/:id/winRate', async(req, res) => {
        res.send('View Deck Winrate');
        let deckId = req.params.ObjectID;

    try {
        const deck = await deckModel.findById(deckId);

        if (!deck) {
            return res.send('Deck not found.');
        }
        const totalGames = deck.deckWins + deck.deckLosses;
        const winRate = totalGames > 0 ? (deck.deckWins / totalGames) * 100 : 0;

        await res.send(`Deck win rate: ${winRate.toFixed(2)}%`);
    } catch (e) {
        console.log('Error calculating win rate:', e);
        await res.send('An error occurred.');
    }
    });

    app.get('/api/card/legality', async(req, res) => { 
        // how are we doing legality? In relation to events? That would be more deck legality vs card legality
        // discuss better legality handling for events, decks, and cards
        res.send('Check Card Legality');
        
    });
}