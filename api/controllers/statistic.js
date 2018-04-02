const routeMongo = require("../helpers/devices.db");
const routeAlarm = require("../helpers/alarms.db");
const logservice = require("../helpers/logs")

//get statistic data
exports.getstatistic = function (args, res, next) {
    routeMongo.GetDevices()
        .then((result) => {
            logservice.logger.info('Statistic operation Get Devices was successfull' )
            // set statistic object and activeDevice to 0 if no devices are conneted
            let statistic = {activeDevices:0}
            let l = result.length
            // number of all devices = the array response of getDevices method
            statistic.allDevices = l
            let connectedDevices = 0
            let countObjects = 0
            let countActiveAlarms = 0
            let CountResolvedAlarms = 0
            let CountAlarmsInProcessing = 0
            // set reference object for matching within the loop, if more devices are assigned to the same object
            let referenceObject
            for (var i = 0; i < l; i++) {
                if (result[i].object !== null && result[i].object !== referenceObject) {
                    countObjects++
                    statistic.allObjects = countObjects
                }
                if (result[i].status === "Connected") {
                    connectedDevices++
                    statistic.activeDevices = connectedDevices
                }
                referenceObject = result[i].object
            }
            // get data from table storage
            routeAlarm.GetAlarms()
                .then((result) => {
                    let l = result.entries.length
                    for (var i = 0; i < l; i++) {
                        if (Object.values(result.entries[i].status)[0] === "active") {
                            countActiveAlarms++
                            statistic.activeAlarms = countActiveAlarms
                        }
                        if (Object.values(result.entries[i].status)[0] === "resolved") {
                            CountResolvedAlarms++
                            statistic.resolvedAlarms = CountResolvedAlarms
                        }
                        if (Object.values(result.entries[i].status)[0] === "in processing") {
                            CountAlarmsInProcessing++
                            statistic.inProcessingAlarms = CountAlarmsInProcessing
                        }
                    }
                    logservice.logger.info('Get Statistic operation was successfull' )
                    // send the statistic object as response
                    return res.send(JSON.stringify(statistic))
                })
                .catch((err) => {
                    logservice.logger.error('Get Statistic operation failed: ' + err.name )
                    return res.status(403).send(JSON.stringify({error:err.name}))
                })
        })
        .catch((err) => {
            logservice.logger.error('Statistic operation Get Devices failed: ' + err.name )
            return res.status(403).send(JSON.stringify({error:err.name}))
        })
}


// get all alarms resolved manually ba technician for example in case of any device replacements
exports.getAllarmReports = function (args, res, next) {
    routeAlarm.GetAlarms()
    .then((result) => {
        let l = result.entries.length
        let resolvedManually  = []
        for (var i = 0; i < l; i++) {
            if (Object.values(result.entries[i].status)[0] === "resolved manually") {
                let obj = {
                    name: Object.values(result.entries[i].Event)[0],
                    object: Object.values(result.entries[i].PartitionKey)[1],
                    deviceid: Object.values(result.entries[i].RowKey)[1].split("_").pop(),
                    activity: Object.values(result.entries[i].activity)[0],
                    updatedTime: Object.values(result.entries[i].Timestamp)[1],
                }
                resolvedManually.push(obj)
            }
        }
        logservice.logger.info('Get all manually resolved alarms operation was successfull' )
        // send the statistic object as response
        return res.send(resolvedManually)
    })
    .catch((err) => {
        logservice.logger.error('Get all manually resolved alarmsoperation failed: ' + err.message )
        return res.status(403).send(JSON.stringify({error:err.message}))
    })
}

// get the number and detials of all sent Notifications
exports.getNotifications = function (args, res, next) {
    routeAlarm.getNotifications()
        .then((result) => {
            let l = result.entries.length
            let obj = {
                allSentNotifications:l
            }
            /*let notifications = []
            for (var i = 0; i < l; i++) {
                let obj = {
                    allSentNotifications: l,
                    email: Object.values(result.entries[i].PartitionKey)[1],
                    status: Object.values(result.entries[i].status)[0],
                    sentTime: Object.values(result.entries[i].Timestamp)[1],
                }
                notifications.push(obj)
            }*/
            logservice.logger.info('Get all notifications operation was successfull')
            // send the statistic object as response
            return res.send(obj)
        })
        .catch((err) => {
            logservice.logger.error('Get all all notifications failed: ' + err.message)
            return res.status(403).send(JSON.stringify({ error: err.message }))
        })
}