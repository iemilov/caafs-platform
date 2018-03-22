'use strict';
const config = require("./config")
// get logger modules
const winston = require("winston");
require("winston-azure-blob-transport");
// get mongo db modules
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const ObjectId = require('mongodb').ObjectID
const url = config.endpoint
const collectionRules = config.collectionr
const collectionDevices = config.collectiond
// get tables storage modules
const azure = require('azure-storage')
// create table service for the alarms
const tableService = azure.createTableService(config.accountName, config.accountKey);
let alerts = config.alarms
let sentNotifications = config.notifications
// create blob service for the telemetry data
let blobSvc = azure.createBlobService(config.accountName, config.accountKey)



// store telemtry data in blob container
function storeTelemtry(message) {
    return new Promise((resolve, reject) => {
        blobSvc.appendBlockFromText(config.containerTelemetry, config.fileTelemetry, message,  (error, result, response) => {
            if (error) reject(error);
            else {
                resolve(response);
            }
        })
    })
}

// create registry iot hub
const iothub = require('azure-iothub');
const registry = iothub.Registry.fromConnectionString(config.connectionString);

// set the logger service
let logger = new (winston.Logger)({
    transports: [
        new (winston.transports.AzureBlob)({
            account: {
                name: config.accountName,
                key: config.accountKey
            },
            containerName: config.container,
            blobName: config.logfile,
            level: "info"
        })
    ]
})


// get all rules form the Mongo DB rules colletion
function getRules(){
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            if (err) reject(err);
            else {
                assert.equal(null, err)
                db.collection(collectionRules).find().toArray (( err, result) => {
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

// store notifications for statistics
function StoreNotifications(message) {
    const entGen = azure.TableUtilities.entityGenerator;
    
    const entity = {
        PartitionKey: entGen.String(message.mail),
        RowKey: entGen.String(message.rowkey),
        status:entGen.String(message.status)
    }
    return new Promise((resolve, reject) => {
        tableService.insertOrReplaceEntity(sentNotifications, entity, (error, result, response) => {
            if (error) reject(error);
            else {
                resolve(response);
            }
        })
    })
}

// store alarm alert or used to resolve it automaticaly in table storage
function StoreAalarm(message) {
    const entGen = azure.TableUtilities.entityGenerator;
    
    const entity = {
        Alert: entGen.String(message.name),
        PartitionKey: entGen.String(message.objectid),
        RowKey: entGen.String(message.rowkey),
        Event: entGen.String(message.event),
        Reference: entGen.String(message.reference),
        status: entGen.String(message.status)
    }
    return new Promise((resolve, reject) => {
        tableService.insertOrReplaceEntity(alerts, entity, function (error, result, response) {
            if (error) reject(error);
            else {
                resolve(response);
            }
        })
    })
}

// list devices in the iot hub and get the connection status
function ListDevices() {
    return new Promise((resolve, reject) => {
            registry.list( (err, deviceList) => {
            if (err) reject(err)
                else {
                    resolve(deviceList)
                }
        })
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
                db.collection(collectionDevices).updateOne(query, 
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
    StoreAalarm,
    StoreNotifications,
    logger,
    getRules,
    DeviceStatus,
    ListDevices,
    storeTelemtry
 }