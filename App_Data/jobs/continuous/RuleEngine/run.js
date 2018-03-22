'use strict';

const config = require("./config");
const EventHubClient = require('azure-event-hubs').Client
const engines = require("./ruleengine")
const helper = require("./helper")
const trackstatus = require("./devicestatus")


// Close connection to IoT Hub if an error occurs and connect again.
IoTHubReaderClient.prototype.resetClient = function () {
    this.iotHubClient.close()
    helper.logger.info('the client will be closed and a new Reader will be started again')
    let iotHubReader = new IoTHubReaderClient(config.connectionString, config.consumerGroupRules);
    iotHubReader.startReadMessage(function (obj, date) {
        try {
            let liveMessage = Object.assign(obj, {})
            engines.RuleEngine.execute(liveMessage)
        } catch (err) {
            helper.logger.error('reading for Rule Engine events failed ' + err);
        }
    })
}

// Read device-to-cloud messages from IoT Hub.
IoTHubReaderClient.prototype.startReadMessage = function (cb) {
    let printError = function (err) {
        helper.logger.error('prototype start reading for Live Data events failed ' + err.message || err)
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
                        helper.logger.info(' created partition receiver for Rule Engine: ' + partitionId + ' on consumer group ' + this.consumerGroupName)
                        receiver.on('errorReceived', printError);
                        receiver.on('message', (message) => {
                            cb(message, Date.parse(message.enqueuedTimeUtc));
                        });
                    }.bind(this));
            }.bind(this));
        }.bind(this))
        .catch(printError)
}
   
function IoTHubReaderClient(connectionString, consumerGroupName) {
    this.iotHubClient = EventHubClient.fromConnectionString(connectionString);
    this.consumerGroupName = consumerGroupName;
}
   
let iotHubReader = new IoTHubReaderClient(config.connectionString, config.consumerGroupRules);
iotHubReader.startReadMessage(function (obj, date) {
    try {
        let liveMessage = Object.assign(obj, {})
        engines.RuleEngine.execute(liveMessage)
    } catch (err) {
        helper.logger.error('reading for Rule Engine events failed ' + err);
    }
})

// track continously the connection status
trackstatus.stat.on('connectionstatus', (data) => {
    engines.RuleEngine.execute(data)
})