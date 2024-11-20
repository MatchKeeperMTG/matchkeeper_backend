import express from 'express';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import jwt from 'node-jsonwebtoken';
import { userProfileModel } from "../index.js";
import { isID } from '../index.js';

/**
 * @param {express.Express} app 
 */
export function userEndpoints(app) {
    app.post('/api/user', async (req, res) => {
        //Create user
        let username = req.body.username;
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let userEmail = req.body.userEmail;
        let password = req.body.password;
        
        let queryUsername = userProfileModel.where({'username': username});
        let queryEmail = userProfileModel.where({'userEmail': userEmail});
        let nameCount = await queryUsername.countDocuments();
        let emailCount = await queryEmail.countDocuments();
        if (nameCount > 0){
            res.status(400);
            res.send({"error": "Username already exists"});
            return;
        } else if (emailCount > 0) {
            res.status(400);
            await res.send({"error": "Email already in use"});
            return;
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const userData = new userProfileModel({
                username: username,
                firstName: firstName,
                lastName: lastName,
                userEmail: userEmail,
                password: hashedPassword,
                wins: 0,
                losses: 0
            });
    
            try {
                await userData.save();
                const token = await jwt.sign({user: userData._id}, process.env.TOKEN_SECRET, {
                    expiresIn: "48h"
                });
                await res.send({"token": token});
            } catch(e) {
                console.log(`Error:\n${e}`);
                res.status(500);
                await res.send({"error": "Database error."});
            }
        }
    });

    app.post('/api/user/login', async (req, res) => {
        let username = req.body.username;
        let password = req.body.password;

        let foundUser = await userProfileModel.findOne({'username': username});
        if(foundUser) {
            const passwordCorrect = await bcrypt.compare(password, foundUser.password);
            if(passwordCorrect) {
                const token = await jwt.sign({user: foundUser._id}, process.env.TOKEN_SECRET, {
                    expiresIn: "48h"
                });
                await res.send({"token": token});
            } else {
                res.status(401);
                res.send({"error": "Incorrect password"});
            }
        } else {
            res.status(400);
            res.send({"error": "No such user"});
        }
    });

    app.post('/api/user/:id', async (req, res) => {
        //Modify User
        let id = req.params.id;
        if (isID(id) && await userProfileModel.findOne({"_id": req.params.id})){
            let username = req.body.username;
            let firstName = req.body.firstName;
            let lastName = req.body.lastName;
            let userEmail = req.body.userEmail;
            let password = req.body.password;

            let queryUsername = userProfileModel.where({'username': username});
            let queryEmail = userProfileModel.where({'userEmail': userEmail});
            let nameCount = await queryUsername.countDocuments();
            let emailCount = await queryEmail.countDocuments();
            if (nameCount > 0){
                res.send("Username already exists");
                return;
            }
            else if (emailCount > 0){
                res.send("Email already in use");
                return;
            }
            
            let query = {'_id': id};
            let newInfo = {'username': username, 'firstName': firstName, 'lastName': lastName, 
                'userEmail': userEmail, 'password': password};
            await userProfileModel.findOneAndUpdate(query, newInfo, {upsert: false});
            res.send('Modify User');
        }
        else{
            res.send('User not found');
        }
    });

    app.post('/api/user/:id/stats', async (req, res) => {
        //Update user statistics
        let id = req.params.id;
        if (isID(id) && await userProfileModel.findOne({"_id": req.params.id})){
            let wins = req.body.wins;
            let losses = req.body.losses;
            let query = userProfileModel.where({'_id': id});
            let newInfo = {'wins': wins, 'losses': losses};
            await userProfileModel.findByIdAndUpdate(id, newInfo, {upsert:false});
            res.send('Update Statistics');
        }
        else{
            res.send('No user found');
            return;
        };  
    })

    app.get('/api/user/:id/stats', async(req, res) => {
        //Get user winrate (by username or ID)
        let id = req.params.id;
        let username = req.body.username;
        let query, user;
        if (username){
            query = userProfileModel.where({'username': username});
            if(query.countDocuments() <= 0){
                res.send({"error": "User does not exist"});
                return;
            }
            user = await query.findOne();
        }
        else{
            if(isID(id) && await userProfileModel.findOne({"_id": req.params.id})) {
                query = userProfileModel.where({'_id': id});
                user = await query.findOne();
            }
            else{
                res.send({"error": "User does not exist"});
                return;
            }
        }
        console.log("Wins: ", user.wins, "Losses: ", user.losses);
        res.send('Get User Winrate by UserName');
    });

    app.delete('/api/user/:id', async (req, res) => {
        //Delete user
        let id = req.params.id;
        if (isID(id) && await userProfileModel.findOne({"_id": req.params.id})){
            let query = {'_id': id};
            await userProfileModel.deleteOne(query);
            res.send('Delete User');
        }
        else{
            res.send('User does not exist');
        }
        
    });

    app.get('/api/user/:id', async (req, res) => {
        //Get all info by username
        let id = req.params.id;
        let username = req.body.username;
        let query, user;
        if (username){
            query = userProfileModel.where({'username': username});
            if(query.countDocuments() <= 0){
                res.send({"error": "User does not exist"});
                return;
            }
            user = await query.findOne();
        }
        else{
            if(isID(id) && await userProfileModel.findOne({"_id": req.params.id})){
                query = userProfileModel.where({'_id': id});
                user = await userProfileModel.findById(id);
            }
            else{
                res.send({"error": "User does not exist"});
                return;
            };
        }
        console.log(user);
        res.send('Get all User Info by UserName');
    });
}

