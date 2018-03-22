const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectID;
const config = require("../config");

const url = config.endpoint
const collection = config.collectionr

// get all rules
function GetRules(){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err);
            else {
                assert.equal(null, err)
                db.collection(collection).find().toArray (function( err, result) {
                    if (err) reject(err);
                    else {
                        resolve (result)
                        db.close()
                    } 
                })
            }
        })
    })
}

// create new rule in the DB
function InsertRule(obj){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err);
            else {
                assert.equal(null, err)
                const query = {rulename:obj.rulename}
                db.collection(collection).findOne(query, (err, result) => {
                    if (err) reject(err);
                    else {
                        if (result !== null && result.rulename == obj.rulename){
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

// remove rule from the DB
function RemoveRule(obj){
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

// update Rule
function UpdateRule(body, rule) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err);
            else {
                assert.equal(null, err)
                let query = { rulename: rule }
                let newObj = { $set: body}
                body.LastModified = new Date()
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

// add Object with device to the Rule
function addObject (body, rule) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err);
            else {
                assert.equal(null, err)
                let query = { rulename: rule }
                let newObj = { $push: { objects: body} }
                //body.AssignedTime = new Date()
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

// add Object with device to the Rule
function removeObject (body, rule) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err);
            else {
                assert.equal(null, err)
                let query = { rulename: rule }
                let newObj = { $pull: { objects: body} }
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

// add Mail with device to the Rule
function addMail (body, rule) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err)
            else {
                assert.equal(null, err)
                let query = { rulename: rule }
                let newObj = { $push: { mailReceiver: body} }
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

// add Object with device to the Rule
function removeMail (body, rule) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err);
            else {
                assert.equal(null, err)
                let query = { rulename: rule }
                let newObj = { $pull: { mailReceiver: body} }
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

function GetRule(obj){
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

module.exports = {
    InsertRule,
    GetRules,
    RemoveRule,
    UpdateRule,
    GetRule,
    addObject,
    removeObject,
    addMail,
    removeMail
}