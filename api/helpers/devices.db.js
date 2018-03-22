const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectID;
const config = require("../config");

const url = config.endpoint
const collection = config.collectiond


function GetDevices(){
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
                });
            }
        });
    })
}

function InsertDevice(obj){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err);
            else {
                assert.equal(null, err)
                const query = {deviceid:obj.deviceid}
                db.collection(collection).findOne(query, (err, result) => {
                    if (err) reject(err);
                    else {
                        if (result !== null && result.deviceid == obj.deviceid){
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

function RemoveDevice(obj){
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

function UpdateDevice(body, deviceid) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err);
            else {
                assert.equal(null, err)
                let query = { deviceid: deviceid }
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

function addCommandOrSensor (body, deviceid) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err);
            else {
                assert.equal(null, err)
                let query = { deviceid: deviceid }
                let newObj = {}
                if (body.hasOwnProperty("sensorType")){
                    let sensorObject = { $push: { sensors: body} }
                    Object.assign(newObj, sensorObject)
                    
                }
                else if (body.hasOwnProperty("commandType")){
                    let commandObject = { $push: { commands: body} }
                    Object.assign(newObj, commandObject)
                } 
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


function removeCommandOrSensor (body, deviceid) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err);
            else {
                assert.equal(null, err)
                let query = { deviceid: deviceid }
                let newObj = {}
                if (body.hasOwnProperty("sensorType")){
                    let sensorObject = { $pull: { sensors: body} }
                    Object.assign(newObj, sensorObject)
                    
                }
                else if (body.hasOwnProperty("commandType")){
                    let commandObject = { $pull: { commands: body} }
                    Object.assign(newObj, commandObject)
                } 

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

function GetDevice(obj){
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

//helper function to update connection status of every device
function DeviceStatus(obj) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err);
            else {
                assert.equal(null, err)
                const query = { deviceid: obj.deviceid }
                db.collection(collection).updateOne(query, 
                    {
                        $set: { "status": obj.status },
                    },
                    (err, result) => {
                    if (err) reject(err);
                    else {
                        resolve(result)
                        db.close()
                    }
                });
            }
        });
    })
}


module.exports = {
    InsertDevice,
    GetDevices,
    RemoveDevice,
    UpdateDevice,
    GetDevice,
    DeviceStatus,
    removeCommandOrSensor,
    addCommandOrSensor
}