'use strict';

const winston = require("winston");
require("winston-azure-blob-transport");

const config = require("../config")
const azure = require('azure-storage')
const blobService = azure.createBlobService(config.accountName, config.accountKey)
const fs = require('fs')

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

// Get logs from the cloud 
function getPlatformLogs(){
    let blobName = config.logfile
    let fileName = 'activity_logs.txt'
    return new Promise((resolve, reject) => {
            blobService.getBlobToStream(config.container, blobName, fs.createWriteStream(fileName), (err, blob) => {
            if (err) reject(err)
            else {
                resolve (fileName)
            }
        })
    })
}

// Get logs for specifific device from the cloud 
function GetDeviceLogs(targetdevice, body){
    let blobName = targetdevice + config.blobname
    let fileName = targetdevice + '_logs.txt'
    return new Promise((resolve, reject) => {
            blobService.getBlobToStream(config.container_devices, blobName, fs.createWriteStream(fileName), (err, blob) => {
            if (err) reject(err)
            else {
                resolve (fileName)
            }
        })
    })
}

function removeBlob(file){
    return new Promise((resolve, reject) => {
        fs.unlink(file,(err, result)=>{
            if (err) reject(err)
            else {
                let result = 'file deleted successfully'
                resolve (result)
            }
        })
   })
}

// List blobs from the blob storage
function ListBlobs(){
    return new Promise((resolve, reject) => {
        blobService.listBlobsSegmented(config.container_devices, null, (err, result, response) => {
            if (err) reject(err);
            else {
                resolve (result)
            }
        });
    })
}

// check if a blob for this device is already uploaded
function CheckBlobs(device, array) {
    let l = array.length
    for (let i = 0; i < l; i++) {
        if (array[i].name == device + config.blobname) {
            return true
        }
    }
}

module.exports = {
    GetDeviceLogs,
    ListBlobs,
    CheckBlobs,
    removeBlob,
    getPlatformLogs,
    logger
}