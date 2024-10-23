import 'express';
import * as mongoose from 'mongoose';

export const deckSchema = new mongoose.Schema({
    name: String,
    description: String
});

/**
 * 
 * @param {Express} app 
 */
export function deckEndpoints(app) {
    app.get('/card/url', (req, res) => {
        res.send("Get Card Image");
    });

    app.post('/deck', (req, res) => {
        res.send("Create Deck");
    });

    app.post('/deck/:id/cards', (req, res) => {
        res.send("Add Card to Deck");
    });

    app.delete('/deck/:id/cards', (req, res) => {
        res.send("Remove Card from Deck");
    });

    app.get('/deck/:id', (req, res) => {
        res.send("View Deck");
    });

    app.get('/deck/:id/winRate', (req, res) => {
        res.send("View Deck Winrate");
    });

    app.get('/card/legality', (req, res) => {
        res.send("Check Card Legality");
    });
}