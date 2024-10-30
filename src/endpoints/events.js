import 'express';
import {eventModel} from "../index.js";

/**
 * @param {Express} app 
 */
export function eventEndpoints(app) {
    app.post('/api/event', (req, res) => {
        res.send('Create Event');
    });

    app.put('/api/event/:id', (req, res) => {
        res.send('Edit Event');
    });

    app.delete('/api/event/:id', (req, res) => {
        res.send('Delete Event');
    });

    app.get('/api/event/:id', (req, res) => {
        res.send('Get Event Details');
    });

    app.get('/api/event/:id/players', (req, res) => {
        res.send('Get Players');
    });

    app.post('/api/event/:id/players', (req, res) => {
        res.send('Add Players');
    });

    app.delete('/api/event/:id/players', (req, res) => {
        res.send('Remove Players');
    });

    app.post('/api/event/:id/decks', (req, res) => {
        res.send('Add Deck to Event');
    });

    app.delete('/api/event/:id/decks', (req, res) => {
        res.send('Remove Deck from Event');
    });

    app.get('/api/event/:id/decks', (req, res) => {
        res.send('View Decks from Event Library');
    });

    app.get('/api/event/:id/bannedCards', (req, res) => {
        res.send('View Banned Cards');
    });

    app.post('/api/event/:id/bannedCards', (req, res) => {
        res.send('Add Banned Card');
    });

    app.delete('/api/event/:id/bannedCards', (req, res) => {
        res.send('Unban Card');
    });
}