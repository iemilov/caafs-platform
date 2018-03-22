'use strict';

const config = require("../config");
const EventHubClient = require('azure-event-hubs').Client
const moment = require('moment')
const logservices = require("../helpers/logs")

// get the reference of EventEmitter class of events module
const hubevent = require('events');
//create an object of EventEmitter class by using above reference
let livedata = new hubevent.EventEmitter()


// Close connection to IoT Hub if an error occurs and connect again.
IoTHubReaderClient.prototype.resetClient = function () {
    this.iotHubClient.close()
    logservices.logger.info('the client will be closed and a new Reader will be started again')
    let iotHubReader = new IoTHubReaderClient(config.connectionString, config.consumerGroupLive);
    iotHubReader.startReadMessage(function (obj, date) {
        try {
            date = date || Date.now()
            let liveMessage = Object.assign(obj, { time: moment.utc(date).format('YYYY:MM:DD[T]hh:mm:ss') })
            livedata.emit('IothubEvents', liveMessage);
        } catch (err) {
            logservices.logger.error('reading for Live Data events failed ' + err);
        }
    })
}
   
// Read device-to-cloud messages from IoT Hub.
IoTHubReaderClient.prototype.startReadMessage = function (cb) {
    var printError = function (err) {
        logservices.logger.error('prototype start reading for Live Data events failed ' + err.message || err)
        iotHubReader.resetClient()
    }

    this.iotHubClient.open()
        .then(this.iotHubClient.getPartitionIds.bind(this.iotHubClient))
        .then(function (partitionIds) {
            return partitionIds.map(function (partitionId) {
                return this.iotHubClient.createReceiver(this.consumerGroupName, partitionId, {
                    'startAfterTime': Date.now()
                })
                    .then(function (receiver) {
                        logservices.logger.info(' created partition receiver for Live Data: ' + partitionId + ' on consumer group ' + this.consumerGroupName)
                        receiver.on('errorReceived', printError);
                        receiver.on('message', (message) => {
                            cb(message.body, Date.parse(message.enqueuedTimeUtc));
                        });
                    }.bind(this));
            }.bind(this));
        }.bind(this))
        .catch(printError);
}
   
function IoTHubReaderClient(connectionString, consumerGroupName) {
    this.iotHubClient = EventHubClient.fromConnectionString(connectionString);
    this.consumerGroupName = consumerGroupName;
}
   
let iotHubReader = new IoTHubReaderClient(config.connectionString, config.consumerGroupLive);
iotHubReader.startReadMessage(function (obj, date) {
    try {
        date = date || Date.now()
        let liveMessage = Object.assign(obj, { time: moment.utc(date).format('YYYY:MM:DD[T]hh:mm:ss') })
        livedata.emit('IothubEvents', liveMessage);
    } catch (err) {
        logservices.logger.error('reading for Live Data events failed ' + err);
    }
})

module.exports = {
    livedata
}