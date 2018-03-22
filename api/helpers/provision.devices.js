'use strict';

const config = require("../config");
const iothub = require('azure-iothub');
const registry = iothub.Registry.fromConnectionString(config.connectionString);
const device = new iothub.Device(null);
const logservice = require("./logs")


//create a device in the IoT Hub
function ProvisionDevice(newdevice) {
    device.deviceId = newdevice
    return new Promise((resolve, reject) => {
      registry.create(device, function(err, deviceInfo, res) {
          if (err) reject(err)
          else {
              resolve(deviceInfo)
          }
      })
    })
}

// remove device from the IoT HUB registry
function DeprovisionDevice(DeviceToDelete){
    device.deviceId = DeviceToDelete
    return new Promise((resolve, reject) => {
    registry.delete(device.deviceId, (err, response) => {
        if (err) reject(err)
      else { 
        resolve(response)     
      }    
    })
  })  
}

//get device status from the IoT Hub
function GetDeviceStatus(obj){
    device.deviceId = obj
    return new Promise((resolve, reject) => {
            registry.get(device.deviceId, (err, deviceInfo) => {
            if (err) reject(err)
                else {
                    resolve(deviceInfo)
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


module.exports = {
    ProvisionDevice,
    DeprovisionDevice,
    GetDeviceStatus,
    ListDevices
}

