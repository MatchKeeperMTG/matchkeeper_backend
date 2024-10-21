import { Express } from 'express';

export function bracketEndpoints(app: Express) {
    app.post('/bracket', (req, res) => {
        res.send("Create Bracket");
    });

    app.post('/bracket/:id', (req, res) => {
        res.send("Edit Bracket");
    });

    app.delete('/bracket/:id', (req, res) => {
        res.send("Delete Bracket");
    });

    app.post('/bracket/:id/results', (req, res) => {
        res.send("Set Win");
    });
}