import express from 'express';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import jwt from 'node-jsonwebtoken';
import { userProfileModel } from "../index.js";
import { isID } from '../index.js';

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
async function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;

    if (!auth) {
        res.status(401);
        res.send({"error": "Authorization header missing."});
        return;
    }

    if (!auth.startsWith('Bearer ')) {
        res.status(401);
        res.send({"error": "Malformed authorization header"});
        return;
    }

    const token = auth.split(' ')[1];

    try {
        const data = jwt.verify(token, process.env.TOKEN_SECRET);

        req.user = data["user"];

        if(!req.user) {
            res.status(401);
            res.send({"error": "Malformed JWT"});
            return;
        }

        const foundUser = await userProfileModel.findById(req.user);

        if(!foundUser) {
            res.status(401);
            res.send({"error": "Tried to authenticate as nonexistent user"});
            return;
        }

        next();
    } catch(err) {
        res.status(401);
        res.send({"error": "Error parsing JWT"});
        return;
    }
}

/**
 * @param {express.Express} app 
 */
export function userEndpoints(app) {
    app.post('/api/user', async (req, res) => {
        // Params
        const username = req.body.username;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const userEmail = req.body.userEmail;
        const password = req.body.password;

        if(!username || !firstName || !lastName || !userEmail || !password) {
            res.status(400);
            res.send({"error": "Incomplete request"});
            return;
        }

        // Create user
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
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
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

    app.put('/api/user', authMiddleware, async (req, res) => {
        let id = req.user;
        if (isID(id) && await userProfileModel.findById(id)){
            let userEmail = req.body.userEmail;

            let queryUsername = userProfileModel.where({'username': req.body.username});
            let queryEmail = userProfileModel.where({'userEmail': userEmail});
            let nameCount = await queryUsername.countDocuments();
            let emailCount = await queryEmail.countDocuments();
            if (nameCount > 0) {
                res.status(400);
                res.send({"error":"Username already exists"});
                return;
            } else if (emailCount > 0) {
                res.status(400);
                res.send({"message":"Email already in use"});
                return;
            }

            let hashedPassword = undefined;
            if (req.body.password) {
                hashedPassword = await bcrypt.hash(req.body.password, 10);
            }
            
            await userProfileModel.findOneAndUpdate({ '_id': id }, {
                    'username': req.body.username, 'firstName': req.body.firstName, 'lastName': req.body.lastName,
                    'userEmail': userEmail, 'password': hashedPassword
                }, {upsert: false});
            res.status(200);
            res.send({});
        }
        else{
            res.status(404);
            res.send({'error':'User not found'});
        }
    });

    app.delete('/api/user/', authMiddleware, async (req, res) => {
        //Delete user
        let id = req.user;
        if (isID(id) && await userProfileModel.findById(id)){
            let query = {'_id': id};
            await userProfileModel.deleteOne(query);
            res.status(200);
            res.send({});
        }
        else{
            res.status(400);
            res.send({'error':'User does not exist'});
        }  
    });

    app.get('/api/user', authMiddleware, async (req, res) => {
        let id = req.user;

        const user = await userProfileModel.findById(id);
        res.status(200);
        res.send({
            "id": user._id,
            "username": user.username,
            "email": user.email,
            "wins": user.wins,
            "losses": user.losses
        });
    });

    app.get('/api/user/:id', async (req, res) => {
        //Get all info by username
        let id = req.params.id;
        let username = req.body.username;
        let query, user;
        if (username){
            query = userProfileModel.where({'username': username});
            if(query.countDocuments() <= 0){
                res.status(400);
                res.send({"error": "User does not exist"});
                return;
            }
            user = await query.findOne();
        }
        else{
            if(isID(id) && await userProfileModel.findById(id)){
                query = userProfileModel.where({'_id': id});
                user = await userProfileModel.findById(id);
            }
            else{
                res.status(400);
                res.send({"error": "User does not exist"});
                return;
            };
        }

        res.status(200);
        res.send({
            "id": user._id,
            "username": user.username,
            "email": user.email,
            "wins": user.wins,
            "losses": user.losses
        });
    });
}

