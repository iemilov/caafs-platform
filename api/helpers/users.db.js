const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectID;
const config = require("../config");

let url = config.endpoint
let collection = config.collectionu

// get particular user from the the MongoDB
function GetUser(obj){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err);
            else {
                assert.equal(null, err)
                db.collection(collection).findOne(obj, (err, result) => {
                    if (err) reject(err);
                    else {
                        resolve (result)
                        db.close()
                    } 
                });
            }
        });
    })
}

// get all users
function GetUsers(){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err);
            else {
                assert.equal(null, err)
                db.collection(collection).find().toArray (( err, result) => {
                    if (err) reject(err);
                    else {
                        resolve (result)
                        db.close()
                    } 
                });
            }
        });
    })
}

// create new user
function InsertUser(obj){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err);
            else {
                assert.equal(null, err)
                const query = {username:obj.username}
                db.collection(collection).findOne(query, (err, result) => {
                    if (err) reject(err);
                    else {
                        if (result !== null && result.username == obj.username){
                            resolve (result)
                        }
                        else {
                            obj.CreatedTime = new Date()
                            db.collection(collection).insert(obj, (err, result) => {
                                if (err) reject(err);
                                else {
                                    resolve (result)
                                    db.close()
                                } 
                            });
                        }
                    }
                });
            }
        });
    })
}

// dlete user from the DB
function RemoveUser(obj){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err);
            else {
                assert.equal(null, err)
                db.collection(collection).deleteOne(obj, (err, result) => {
                    if (err) reject(err);
                    else {
                        resolve (result)
                        db.close()
                    } 
                });
            }
        });
    })
}

// update user
function UpdateUser(body, user) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err)
            else {
                assert.equal(null, err)
                let query = { username: user }
                let newObj = { $set: body}
                body.LastModifiedTime = new Date()
                db.collection(collection).updateOne(query, newObj, (err, result) => {
                    if (err) reject(err);
                    else {
                        resolve(result)
                        db.close()
                    }
                })
            }
        })
    })
}

module.exports = {
    GetUser,
    InsertUser,
    GetUsers,
    RemoveUser,
    UpdateUser,
}