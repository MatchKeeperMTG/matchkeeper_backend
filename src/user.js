import 'express';
import * as mongoose from 'mongoose';

/**
 * @param {Express} app 
 */
export function userEndpoints(app) {
    app.post('/user', (req, res) => {
        res.send("Create User");
    });

    app.post('/user/:id', (req, res) => {
        res.send("Modify User");
    });

    app.post('/user/:id/stats', (req, res) => {
        res.send("Update Statistics");
    })

    app.get('/user/:id/stats', (req, res) => {
        res.send("Get User Winrate by UserName");
    });

    app.delete('/user/:id', (req, res) => {
        res.send("Delete User");
    });

    app.get('/user/:id', (req, res) => {
        res.send("Get all User Info by UserName");
    });
}