import { Express } from 'express';

export function eventEndpoints(app: Express) {
    app.post('/event', (req, res) => {
        res.send("Create Event");
    });

    app.put('/event/:id', (req, res) => {
        res.send("Edit Event");
    });

    app.delete('/event/:id', (req, res) => {
        res.send("Delete Event");
    });

    app.get('/event/:id', (req, res) => {
        res.send("Get Event Details");
    });

    app.get('/event/:id/players', (req, res) => {
        res.send("Get Players");
    });

    app.post('/event/:id/players', (req, res) => {
        res.send("Add Players");
    });

    app.delete('/event/:id/players', (req, res) => {
        res.send("Remove Players");
    });

    app.post('/event/:id/decks', (req, res) => {
        res.send("Add Deck to Event");
    });

    app.delete('/event/:id/decks', (req, res) => {
        res.send("Remove Deck from Event");
    });

    app.get('/event/:id/decks', (req, res) => {
        res.send("View Decks from Event Library");
    });

    app.get('/event/:id/bannedCards', (req, res) => {
        res.send("View Banned Cards");
    });

    app.post('/event/:id/bannedCards', (req, res) => {
        res.send("Add Banned Card");
    });

    app.delete('/event/:id/bannedCards', (req, res) => {
        res.send("Unban Card");
    });
}