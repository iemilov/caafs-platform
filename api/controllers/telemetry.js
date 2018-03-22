
const route = require("../helpers/telemetry");
const logservice = require("../helpers/logs")

//start of getting a particular sensor reading per object routing
exports.getTelemetryObject = function (args, res, next) {

  let object = args.swagger.params.object.value
  let sensor = args.swagger.params.sensor.value
  
  route.readTelemtry()
    .then((result) => {
      logservice.logger.info('Getting sensor reading for object: ' + object + ' and sensor: ' + sensor)
      let modifiedResult = JSON.parse('[' + result.replace(/}{/g, '},{') + ']')
      let newResult = []
      let l = modifiedResult.length
      for (var i = 0; i < l; i++) {
        if (modifiedResult[i].objectid == object && modifiedResult[i].sensor == sensor) {
          newResult.push(modifiedResult[i])
        }
      }
      if (newResult.length == 0){
        logservice.logger.error('Getting sensor reading for deviceId operation failed:. There is no such stored sensor readings for this object/sensor combination')
        return res.status(404).send({message:'There is no such stored sensor readings for this object/sensor combination'})
      }
      else {
        return res.send(newResult)
      }
    })
    .catch((err) => {
      logservice.logger.error('Getting sensor per object operation failed:' + err.message)
      return res.status(403).send(JSON.stringify({ error: err.message }))
    })
}

//start of getting all sensor readings per object routing
exports.getTelemetryObjectAll = function (args, res, next) {
  
  let object = args.swagger.params.object.value
  
  route.readTelemtry()
    .then((result) => {
      logservice.logger.info('Getting all sensor readings for object: ' + object)
      let modifiedResult = JSON.parse('[' + result.replace(/}{/g, '},{') + ']')
      let newResult = []
      let l = modifiedResult.length
      for (var i = 0; i < l; i++) {
        if (modifiedResult[i].objectid == object) {
          newResult.push(modifiedResult[i])
        }
      }
      if (newResult.length == 0){
        logservice.logger.error('Getting all sensor readings for object operation failed:. There is no such stored sensor readings for this object')
        return res.status(404).send({message:'There is no such stored sensor readings for this object'})
      }
      else {
        return res.send(newResult)
      }
    })
    .catch((err) => {
      logservice.logger.error('Getting  all sensor readings per object operation failed:' + err.message)
      return res.status(403).send(JSON.stringify({ error: err.message }))
    })
}

//start of getting a particular sensor reading per deviceid routing
exports.getTelemetryDevice = function (args, res, next) {
  
    let deviceid = args.swagger.params.deviceid.value
    let sensor = args.swagger.params.sensor.value
  
  route.readTelemtry()
    .then((result) => {
      logservice.logger.info('Getting sensor reading for deviceid: ' + deviceid + ' and sensor: ' + sensor)
      let modifiedResult = JSON.parse('[' + result.replace(/}{/g, '},{') + ']')
      let newResult = []
      let l = modifiedResult.length
      for (var i = 0; i < l; i++) {
        if (modifiedResult[i].deviceid == deviceid && modifiedResult[i].sensor == sensor) {
          newResult.push(modifiedResult[i])
        }
      }
      if (newResult.length == 0){
        logservice.logger.error('Getting sensor reading for deviceId operation failed:. There is no such stored sensor readings for this device/sensor combination')
        return res.status(404).send({message:'There is no such stored sensor readings for this device/sensor combination'})
      }
      else {
        return res.send(newResult)
      }
    })
    .catch((err) => {
      logservice.logger.error('Getting sensor reading for deviceId operation failed:' + err.message)
      return res.status(403).send(JSON.stringify({ error: err.message }))
    })
}

// helper function: read raw telemetry data, convert them to csv file and download them, remove file from express server
function createCSV(res) {
  route.readTelemtry()
    .then((result) => {
      let modifiedResult = JSON.parse('[' + result.replace(/}{/g, '},{') + ']')
      route.convertToCSV(modifiedResult)
      route.getCSV()
        .then((fileName) => {
          logservice.logger.info('Download CSV operation executed successfully')
          res.download(fileName)
          res.on('finish', function () {
            logservice.logger.info('The requested file' + fileName + ' was temporary stored on the express server and removed successfull')
            logservice.removeBlob(fileName)
          })
        })
    })
}

//start of getting all telemetry readings as CSV file routing
exports.getTelemetryCSV = function (args, res, next) {
  route.ifBlobExists()
    .then((result) => {
      if (result.statusCode == 200) {
        route.deleteBlob()
          .then(route.createBlob())
          .then(createCSV(res))
      }
      //if such blob not exists, a new blob file will be created prepared for download
      else {
        route.createBlob()
        .then(createCSV(res))
      }
    })
    .catch((err) => {
      logservice.logger.error('Checking if blob telemetry.csv exists failed: ' + err.message)
      return res.status(403).send(JSON.stringify({ error: err.message }))
    })
}
