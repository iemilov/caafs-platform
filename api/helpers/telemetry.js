'use strict';
const config = require("../config");
const azure = require('azure-storage')
let blobSvc = azure.createBlobService(config.accountName, config.accountKey)
const fs = require('fs')

const logservice = require("./logs")

var json2csv = require('promise-simple-json2csv');

var options = {
    data: [],
    fields : ['objectid', 'deviceid', 'sensor', 'value', 'timestamp'],
    header: true
}

// store telemtry data additionally as csv file
function storeTelemtry(message) {
    let file = 'telemetry.csv'
    return new Promise((resolve, reject) => {
        blobSvc.appendBlockFromText(config.containerTelemetry, config.CSV, message,  (error, result, response) => {
            if (error) reject(error);
            else {
                resolve(response);
            }
        })
    })
}

// delete telemetry csv file if exists
function deleteBlob() {
    return new Promise((resolve, reject) => {
        blobSvc.deleteBlobIfExists(config.containerTelemetry, config.CSV,  (error, result, response) => {
            if (error) reject(error);
            else {
                resolve(response);
            }
        })
    })
}


// read telemetry
function readTelemtry() {
    return new Promise((resolve, reject) => {
        blobSvc.getBlobToText (config.containerTelemetry, config.fileTelemetry, (error, result, response) => {
            if (error) reject(error);
            else {
                resolve(result);
            }
        })
    })
}

// check if blob exists
function ifBlobExists() {
    return new Promise((resolve, reject) => {
        blobSvc.doesBlobExist(config.containerTelemetry, config.CSV, function (error, result, response) {
            if (error) reject(error);
            else {
                resolve(response);
            }
        })
    })
}

// create blob for telemetry data
function createBlob() {
    return new Promise((resolve, reject) => {
        blobSvc.createAppendBlobFromText(config.containerTelemetry, config.CSV, '', function (error, result, response) {
            if (error) reject(error);
            else {
                resolve(response);
            }
        })
    })
}

// Get CSV file
function getCSV() {
    let blobName = config.CSV
    let fileName = 'telemetry.csv'
    return new Promise((resolve, reject) => {
        blobSvc.getBlobToStream(config.containerTelemetry, blobName, fs.createWriteStream(fileName), (err, blob) => {
            if (err) reject(err)
            else {
                resolve(fileName)
            }
        })
    })
}

module.exports = {
    readTelemtry,
    deleteBlob,
    ifBlobExists,
    createBlob,
    getCSV,
    storeTelemtry,
    json2csv,
    options
}