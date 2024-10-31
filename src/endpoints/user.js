import 'express';
import * as mongoose from 'mongoose';
import { userProfileModel } from "../index.js";

/**
 * @param {Express} app 
 */

//this is to test that this seperation will work for tjr project
//this makes the schema for the user
// const userProfileSchema = new mongoose.Schema({
//     username: String,
//     firstName: String,
//     lastName: String,
//     userEmail: String,
//     password: String,
//     wins: Number,
//     losses: Number
//   });
//   //applies the schema to a model
//   const userProfileModel = mongoose.model('UserProfile', userProfileSchema);



export function userEndpoints(app) {
    app.post('/api/user', (req, res) => {
        res.send("Create User");

        //this is a test user, in future this will be filled with information from UI
        const testData = new userProfileModel({
            username: "myUsername",
            firstName: "Jerry",
            lastName: "Subwoofer",
            userEmail: "bigboom35@gmail.com",
            password: "IfYouCantHearMeYoureDeaf",
            wins: 0,
            losses: 0
          });

        //saves the data and displays in the console
        testData.save()
        .then(doc => {
            console.log('Test document saved:', doc);
        })
        .catch(error => {
            console.error('Error saving test document:', error);
        });

    });

    app.post('/api/user/:id', (req, res) => {
        res.send("Modify User");

        const testData = userProfileModel.findOne({'firstName':'Jerry'});

        //saves the data and displays in the console
        testData.save()
        .then(doc => {
            console.log('Test document saved:', doc);
        })
        .catch(error => {
            console.error('Error saving test document:', error);
        });
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