'use strict';
const config = require("../config");
const Client = require('azure-iothub').Client;
const connectionString = config.connectionString
const iothub = require('azure-iothub');
const registry = iothub.Registry.fromConnectionString(config.connectionString);
const device = new iothub.Device(null);
var uuid = require('uuid')

const client = Client.fromConnectionString(connectionString);

let methods = ['setNewInterval', 'startTelemetry', 'stopTelemetry', 'uploadLogs', 'reboot', 'firmwareUpdate', 'getMetadata', 'monitor']

function findMethod(method){
    let l = methods.length
    for (let i = 0; i < l; i++){
        if (methods[i] == method){
            return true
        }
    }
}

//execute different methods on a devices
function ExecuteMethod(message, deviceid){
    const targetDevice = deviceid
    const methodParams = {
        methodName: message.command, 
        payload: message.payload,
        responseTimeoutInSeconds: 30 // set response timeout as 20 seconds 
    }
    return new Promise((resolve, reject) => {
        client.invokeDeviceMethod(targetDevice, methodParams, (err, result) => {
            if (err) reject(err);
            else {
                resolve (result)
            }
        });
    })
}

// Get the twin and output the reboot status from reported properties
function GetTwin(targetdevice){
    return new Promise((resolve, reject) => {
        registry.getTwin(targetdevice, (err, twin) => {
            if (err) reject(err);
            else {
                resolve (twin)
            }
        })
    })
}

// helper function to update status of device twin
function reportThroughTwin(body, targetdevice) {
    return new Promise((resolve, reject) => {
        registry.getTwin(targetdevice, (err, twin) => {
            if (err) reject(err)
            else {
                resolve(twin)
                let patch = {
                    properties: {
                        desired: {
                            WaitingCommand: {
                                commandId: body.command,
                                CommandRequestTime: new Date().toISOString(),
                                payload: body.payload
                           }
                        }
                    }
                }
                twin.update(patch, (err) => {
                    if (err) console.log('Error updating twin' + err)
                    else console.log('Device twin state updated')
                })
            }
        })
    })
}

// data holder for GetDeviceKey and GenerateKey methods
let refObject = []

function IfExists (object){
    const length = refObject.length
    for (var i = 0; i < length; i++) {
        if (refObject[i] == object) {
            return true
        }
    }
}

function remove (object){
    const length = refObject.length
    for (var i = 0; i < length; i++) {
        if (refObject[i] == object) {
            refObject.splice(i, 1)
			break
        }
    }
}

function GetDeviceKey(object){
    device.deviceId = object
    return new Promise((resolve, reject) => {
            registry.get(device.deviceId, (err, deviceInfo) => {
            if (err) reject(err)
                else {
                    if (!IfExists (device.deviceId)) {
                        refObject.push(device.deviceId)
                        let message = {
                            endpoint: '',
                            text: 'for security reasons this info will appear only once. Please copy and save this endpoint safe'
                        }
                        message.endpoint = config.connectionString.substring(0, config.connectionString.indexOf(";")) + 
                        ';' + 'DeviceId=' + deviceInfo.deviceId + ';' + 'SharedAccessKey=' + deviceInfo.authentication.symmetricKey.primaryKey
                        resolve(message)
                    }
                    else {
                        let message = {text:'for security reasons this info is not available anymore. Please contact your main administrator'}
                        resolve(message)
                    }
                }
        })
    })    
} 

// generate new key for a device
function GenerateKey(object) {
    let message = {
        deviceId: object,
        authentication: {
            symmetricKey: {
                primaryKey: new Buffer(uuid.v4()).toString('base64'),
                secondaryKey: new Buffer(uuid.v4()).toString('base64')
            }
        }
    }
    return new Promise((resolve, reject) => {
        registry.update(message, (err, result) => {
            if (err) reject(err)
            else {
                remove(object)
                let result = { text: 'New key for ' + object + ' was generated. Go to getKey button to store the new key' }
                resolve(result)
            }
        })
    })
} 

module.exports = {
    ExecuteMethod,
    GetDeviceKey,
    GenerateKey,
    GetTwin,
    reportThroughTwin,
    findMethod
}

