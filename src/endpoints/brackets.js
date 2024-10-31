import express from 'express';
import {bracketModel} from '../index.js';

/**
 * @param {express.Express} app 
 */
export function bracketEndpoints(app) {
    app.post('/api/bracket', (req, res) => {
        console.log(req.body);
        res.send('Okay.');
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