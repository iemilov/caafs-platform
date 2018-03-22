'use strict';
const helper = require("./helper")

// request the connection state per device every 3 seconds and write it to the DB
const statusevent = require('events');
//create an object of EventEmitter class by using above reference
let stat = new statusevent.EventEmitter()

setInterval(function () {
    helper.ListDevices()
        .then((deviceList) => {
            deviceList.forEach(function (device) {
                const connectionstatus = device.connectionState ? device.connectionState : '<no status >';
                const newstatus = {
                    deviceid: device.deviceId,
                    status: connectionstatus
                }
                stat.emit('connectionstatus', newstatus);
            })
        })
        .catch((err) => {
            helper.logger.error('Listing devices to track connection status RuleEngine, connection status was not updated ' + err.name)
        })
}, 3000)

// device status holder
let statusHolder = []

// assign the status value to the device
function assignValue(data) {
    let l = statusHolder.length
    for (var i = 0; i < l; i++) {
        if (statusHolder[i].deviceid == data.deviceid)
            statusHolder[i].status = data.status
    }
}

// check if device exists in the statusHolder
function ifExists (data) {
    let l = statusHolder.length
    for (var i = 0; i < l; i++) {
        if (statusHolder[i].deviceid === data.deviceid) return true
    }
}

// comapre the incomming conenction status with the stored one in the statusHolder
function compare(data){
    let l = statusHolder.length
    for (var i = 0; i< l; i++){
        if (statusHolder[i].deviceid == data.deviceid && statusHolder[i].status !== data.status)
        return true
    }
}

// update the device status only if it is changed
stat.on('connectionstatus', (data) => {
    if (!ifExists(data) || statusHolder.length == 0){
        statusHolder.push(data)
        helper.DeviceStatus(data)
    } 
    if (compare(data)){
        assignValue(data)
        helper.DeviceStatus(data)
        helper.logger.info('connection status changed ' + JSON.stringify(data))
    }
})

module.exports = {
    stat
 }