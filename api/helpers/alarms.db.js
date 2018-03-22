'use strict';

const config = require("../config");

const azure = require('azure-storage')
const tableService = azure.createTableService(config.accountName, config.accountKey)
let alerts = config.alarms
let sentNotifications = config.notifications

//get all alarms
function GetAlarms() {
    const query = new azure.TableQuery()
    return new Promise((resolve, reject) => {
        tableService.queryEntities(alerts, query, null, function(err, result, response) {
            if (err) reject(err);
            else {
                resolve(result);
            }
        })
    })    
}

//get all alarms
function getNotifications() {
    const query = new azure.TableQuery()
    return new Promise((resolve, reject) => {
        tableService.queryEntities(sentNotifications, query, null, (err, result, response) =>{
            if (err) reject(err);
            else {
                resolve(result);
            }
        })
    })    
}


//get Etag for particular alarm to avoid concurrency during updating the alarm status
function GetAlarm(body){
    return new Promise((resolve, reject) => {
        tableService.retrieveEntity(alerts, body.object, body.alarmid, (err, result, response) => {
            if (err) reject(err);
            else {
                resolve(result);
            }
        })
    })
}


//get all alarms per object
function GetAlarmObject() {
    const query = new azure.TableQuery()
    return new Promise((resolve, reject) => {
        tableService.queryEntities(alerts, query, null, (err, result, response) => {
            if (err) reject(err);
            else {
                resolve(result);
            }
        })
    })    
}

//remove all alarms per object
function deleteAlarmsObject(alarms) {
    let l = alarms.length
    let promises = []
    let counter = 0

    return new Promise((resolve, reject) => {
        for (var i = 0; i < l; i++) {
            let task = {
                PartitionKey: { "_": alarms[i].objectid },
                RowKey: { "_": alarms[i].rowkey }
            }
            tableService.deleteEntity(alerts, task, function (err, response) {
                if (err) reject(err);
                else {
                    promises.push(response)  
                }
                if(counter == l - 1) {
                    resolve(promises)
                }
                counter++  
            });
        }
    })   
}

//remove all existing alarms
function removeAllAlarms(alarms) {
    let l = alarms.length
    let promises = []
    let counter = 0

    return new Promise((resolve, reject) => {
        for (var i = 0; i < l; i++) {
            let task = {
                PartitionKey: { "_": alarms[i].objectid },
                RowKey: { "_": alarms[i].rowkey }
            }
            tableService.deleteEntity(alerts, task, function (err, response) {
                if (err) reject(err);
                else {
                    promises.push(response)  
                }
                if(counter == l - 1) {
                    resolve(promises)
                }
                counter++  
            })
        }
    })    
}

//delete one particular alarm
function DeleteAlarm(body, currentEtag) {
    let task = {
        PartitionKey: { "_" : body.object},
        RowKey: { "_" : body.alarmid},
        '.metadata': {etag:currentEtag}
    }
    return new Promise((resolve, reject) => {
        tableService.deleteEntity(alerts, task, function(err, response) {
            if (err) reject(err);
            else {
                resolve(response);
            }
        })
    })    
}

//delete several picked alarms
function DeleteAlarms(alarms) {
    let l = alarms.length
    let promises = []
    let counter = 0

    return new Promise((resolve, reject) => {
        for (var i = 0; i < l; i++) {
            let task = {
                PartitionKey: { "_": alarms[i].object },
                RowKey: { "_": alarms[i].alarmid }
            }
            tableService.deleteEntity(alerts, task, function (err, response) {
                if (err) reject(err);
                else {
                    promises.push(response)  
                }
                if(counter == l - 1) {
                    resolve(promises)
                }
                counter++  
            });
        }
    });
}

// update the satus of the alarm (for example resolved by technician) by changing the triggered event
function UpdateStatusAlarm(message, currentEtag) {
    const entGen = azure.TableUtilities.entityGenerator;
    const entity = {
        PartitionKey: entGen.String(message.object),
        RowKey: entGen.String(message.alarmid),
        status: entGen.String(message.status),
        Event: entGen.String(message.event),
        activity: entGen.String(message.activity),
        '.metadata': {etag:currentEtag}
    }
    return new Promise((resolve, reject) => {
        tableService.mergeEntity(alerts, entity, (error, result, response) => {
            if (error) reject(error);
            else {
                resolve(result)
            }
        })
    })
}

module.exports = {
    GetAlarms,
    DeleteAlarm,
    DeleteAlarms,
    UpdateStatusAlarm,
    GetAlarmObject,
    deleteAlarmsObject,
    removeAllAlarms,
    GetAlarm,
    getNotifications
 }