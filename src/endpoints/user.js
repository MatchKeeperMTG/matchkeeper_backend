import 'express';
import * as mongoose from 'mongoose';

/**
 * @param {Express} app 
 */
export function userEndpoints(app) {
    app.post('/api/user', (req, res) => {
        res.send("Create User");
    });

    app.post('/api/user/:id', (req, res) => {
        res.send("Modify User");
    });

    app.post('/api/user/:id/stats', (req, res) => {
        res.send("Update Statistics");
    })

    app.get('/api/user/:id/stats', (req, res) => {
        res.send("Get User Winrate by UserName");
    });

    app.delete('/api/user/:id', (req, res) => {
        res.send("Delete User");
    });

    app.get('/api/user/:id', (req, res) => {
        res.send("Get all User Info by UserName");
    });
}