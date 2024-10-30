import 'express';
import {bracketModel} from '../index.js';

/**
 * @param {Express} app 
 */
export function bracketEndpoints(app) {
    app.post('/api/bracket', (req, res) => {
        res.send('Create Bracket');
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