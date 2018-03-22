const route = require("../helpers/device.methods")
const logservice = require("../helpers/logs")


//start of executing a command on a particular device routing
exports.methodspost = function (args, res, next) {
    let deviceid = args.swagger.params.deviceid.value
    let method = args.body.command
    if (!args.body.hasOwnProperty("payload")) {
        args.body.payload = null
    }
    route.ExecuteMethod(args.body, deviceid)
        .then((result) => {
            logservice.logger.info(method + ' on ' + deviceid + ' executed successfully')
            return res.send({message:result.payload})
        })
        .catch((err) => {
            if (err.response.statusCode == 404) {
                if (!route.findMethod(method)) {
                    logservice.logger.error(method + ' on ' + deviceid + err.message)
                    return res.status(404).send({ error: method + ' ' + err.message })
                } else {
                    route.reportThroughTwin(args.body, deviceid)
                        .then((result) => {
                            logservice.logger.info('twin' + ' on ' + deviceid + ' was updated with new waiting command: ' + method)
                            return res.status(404).send({
                                text: 'device is probably offline. The command will be stored as waiting command.' +
                                    ' Only one command can be in waiting mode per device. Every new command will overrite the previuos one. Once the device is online again the last waiting command will be executed !'
                            })
                        })
                        .catch((err) => {
                            logservice.logger.error('Update twin operation ' + ' on ' + deviceid + ' failed: ' + err.name )
                            return res.status(404).send({ error: err.name })
                        })
                }
            }
        })
}

//start of getting metadata for a particular device routing after executing the command "getMetada" on the device
exports.getmetadata = function (args, res, next) {
    let deviceid = args.swagger.params.deviceid.value
    let object = {
		"command": "getMetadata"
    }
    route.ExecuteMethod(object, deviceid)
      .then((result) => {
          return res.send(result.payload)
      })
      .catch((err) => {
        return res.status(403).send(err.message)
      })
}

//start of getting monitor data for a particular device routing after executing the command "getMetada" on the device
exports.getmonitor = function (args, res, next) {
    let deviceid = args.swagger.params.deviceid.value
    let object = {
		"command": "monitor"
    }
    route.ExecuteMethod(object, deviceid)
      .then((result) => {
        logservice.logger.info('Monitor operation' + ' on ' + deviceid + ' executed successfully')
          return res.send(result.payload)
      })
      .catch((err) => {
        logservice.logger.info('Monitor operation' + ' on ' + deviceid + ' failed: ' + err.message)
        return res.status(403).send({erorr:err.message})
      })
}

//start of getting logs for a particular device
exports.getlogs = function (args, res, next) {
    let device = args.swagger.params.deviceid.value
    logservice.ListBlobs()
        .then((result) => {
            if (logservice.CheckBlobs(device, result.entries)){
                logservice.GetDeviceLogs(device)
                .then((fileName) => {
                    logservice.logger.info('Download operation' + ' on ' + device + ' executed successfully')
                    res.download(fileName)
                    res.on('finish', function() {
                        logservice.logger.info('The requested file ' + fileName + ' was temporary stored on the express server and removed successfull')
                        logservice.removeBlob(fileName)
                    })
                })
                .catch((err) => {
                    logservice.logger.error('Download operation' + ' on ' + device + ' failed:' + err.name)
                    return res.status(403).send({error:err.name})
                })
            }
            else return res.status(404).send({ text: 'there is no logs for this device. Please execute UploadLogs method on this device first' })   
        }) 
        .catch((err) => {
            logservice.logger.info('List blobs operation failed: '  + err.name)
            return res.status(403).send({error:err.name})
        })
}

//start of get progress on a particular device routing
exports.getprogress = function (args, res, next) {
    let deviceid = args.swagger.params.deviceid.value
    route.GetTwin(deviceid)
      .then((twin) => {
        logservice.logger.info('Get progress operation' + ' on ' + deviceid + ' executed successfully')
          return res.send(twin.properties.reported.iothubDM)
        //return res.send(twin)
      })
      .catch((err) => {
        logservice.logger.error('Get progress operation' + ' on ' + deviceid + ' failed: ' + err.name)
        return res.status(403).send({error:err.name})
      })
}

//start of get waiting job on a particular device routing
exports.getjob = function (args, res, next) {
    let deviceid = args.swagger.params.deviceid.value
    route.GetTwin(deviceid)
      .then((twin) => {
          //return res.send(twin.properties.desired.WaitingCommand)
          logservice.logger.info('Get waiting job' + ' on ' + deviceid + ' executed successfully')
           return res.send(twin.properties.desired)
      })
      .catch((err) => {
        logservice.logger.error('Get waiting job' + ' on ' + deviceid + ' failed: ' + err.name)
        return res.status(403).send({error:err.name})
      })
}

//start of getting the ednpoint for a particular device routing
// this route should be executed only once
exports.methods_getendpoint = function (args, res, next) {
    let deviceid = args.swagger.params.deviceid.value
        route.GetDeviceKey(deviceid)
            .then((result) => {
                logservice.logger.info('Get endpoint' + ' on ' + deviceid + ' executed successfully')
                return res.send(result)
            })
            .catch((err) => {
                logservice.logger.error('Get endpoint' + ' on ' + deviceid + ' failed: ' + err.name)
                return res.status(403).json({error:err.name})
            })
}

//start of generating a new endpoint for a particular device routing
//this route should be executed only once
exports.methods_putendpoint = function (args, res, next) {
        route.GenerateKey(args.swagger.params.deviceid.value)
            .then((result) => {
                logservice.logger.info('Gnerate new endpoint' + ' on ' + deviceid + ' executed successfully')
                return res.send(result)
            })
            .catch((err) => {
                logservice.logger.error('Gnerate new endpoint' + ' on ' + deviceid + ' failed: ' + err.name)
                return res.status(403).json({error:err.name})
            })
}