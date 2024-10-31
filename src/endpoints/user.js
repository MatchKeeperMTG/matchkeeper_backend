import express from 'express';
import * as mongoose from 'mongoose';
import { userProfileModel } from "../index.js";

/**
 * @param {express.Express} app 
 */
export function userEndpoints(app) {
    app.post('/api/user', async (req, res) => {
        //this is a test user, in future this will be filled with information from UI
        const testData = new userProfileModel({
            username: 'myUsername',
            firstName: 'Jerry',
            lastName: 'Subwoofer',
            userEmail: 'bigboom35@gmail.com',
            password: 'IfYouCantHearMeYoureDeaf',
            wins: 0,
            losses: 0
        });

        try {
            await testData.save();
            await res.send('User created.');
        } catch {
            console.log('Error saving test data');
            await res.send('An error occurred.');
        }
    });

    app.post('/api/user/:id', async (req, res) => {

        var query = {'firstName': 'Jerry'};
        var newName = {'firstName': 'Freakazoid', 'lastName': 'Fragrance'};

        await userProfileModel.findOneAndUpdate(query, newName, {upsert: false});
        await res.send('Done');
    });

    app.post('/api/user/:id/stats', (req, res) => {
        res.send('Update Statistics');
    })

    app.get('/api/user/:id/stats', (req, res) => {
        res.send('Get User Winrate by UserName');
    });

    app.delete('/api/user/:id', (req, res) => {
        res.send('Delete User');
    });

    app.get('/api/user/:id', (req, res) => {
        res.send('Get all User Info by UserName');
    });
}