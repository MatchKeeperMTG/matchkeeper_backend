import 'express';
import * as mongoose from 'mongoose';
import { userProfileModel } from "../index.js";

/**
 * @param {Express} app 
 */
export function userEndpoints(app) {
    app.post('/api/user', async (req, res) => {
        //this is a test user, in future this will be filled with information from UI
        let username = req.body.username;
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let userEmail = req.body.userEmail;
        let password = req.body.password;
        const testData = new userProfileModel({
            username: username,
            firstName: firstName,
            lastName: lastName,
            userEmail: userEmail,
            password: password,
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
        let username = req.body.username;
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let userEmail = req.body.userEmail;
        let password = req.body.password;
        //let id = 'ObjectId'
        let query = {'_id': ''};


        let newName = {'firstName': 'yrreJ', 'lastName': 'Fragrance'};
        console.log(req.params.id);

        await userProfileModel.findOneAndUpdate(query, newName, {upsert: false});
        res.send('Modify User');
    });

    app.post('/api/user/:id/stats', (req, res) => {
        res.send('Update Statistics');
    })

    app.get('/api/user/:id/stats', (req, res) => {
        res.send('Get User Winrate by UserName');
    });

    app.delete('/api/user/:id', async (req, res) => {
        let query = {'firstName': 'yrreJ'};
        await userProfileModel.deleteOne(query);
        res.send('Delete User');
    });

    app.get('/api/user/:id', (req, res) => {
        res.send('Get all User Info by UserName');
    });
}