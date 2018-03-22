
const route = require("../helpers/devices.db");
const provision = require("../helpers/provision.devices");
const logservices = require("../helpers/logs")


//get all devices routing
exports.devicesGet = function (args, res, next) {
    route.GetDevices()
        .then((result) => {
            logservices.logger.info('GetDevices operation successfull')
            return res.send(result); 
        })
        .catch((err) => {
            logservices.logger.error('GetDevices operation failed ' + err.name)
            return res.status(403).send(JSON.stringify({error:err.name}))
        })
};

//start of creating device routing
exports.devicesPost = function (args, res, next) {
    route.InsertDevice(args.body)
        .then((result) => {
            if (result.insertedCount > 0) {
                // provison the same device id to the DB
                provision.ProvisionDevice(args.body.deviceid)
                .then((deviceInfo) => {
                    logservices.logger.info('CreateDevice operation in the IoTHUB successfull')
                    return res.status(201).send('')
                })
                .catch((err) => {
                    //delete the device from the DB if the provisionning to the HUB crashes
                    route.RemoveDevice(args.body)
                    logservices.logger.error('CreateDevice operation to the IoTHUB failed')
                    return res.status(403).send(JSON.stringify(err.code))
                })
            }
            else {
                logservices.logger.error('CreateDevice operation failed:    this deviceid already exists')
                return res.status(409).send({error:'this deviceid already exists'})
            }
        })
        .catch((err) => {
            logservices.logger.error('CreateDevice operation failed ' + err.name)
            return res.status(403).send(JSON.stringify({error:err.name}))
        })
}

//start of updating a particular device routing
exports.devicesPut = function (args, res, next) {
    let deviceid = args.swagger.params.deviceid.value
    route.UpdateDevice(args.body, deviceid)
      .then((result) => {
        if (result.modifiedCount > 0) {
          logservices.logger.info('UpdateDevice operation successfull')
          return res.status(200).send('')
        }
        else {
          logservices.logger.error('UpdateDevice operation failed: there is no such deviceid ')
          return res.status(404).send({message:'there is no such deviceid '})
        }
      })
      .catch((err) => {
        logservices.logger.error('UpdateDevice operation failed ' + err.name)
        return res.status(403).send(JSON.stringify({error:err.name}))
      })
}

// remove sensor or command route
exports.SensorsCommandsRemove = function (args, res, next) {
    let deviceid = args.swagger.params.deviceid.value
    route.removeCommandOrSensor(args.body, deviceid)
      .then((result) => {
        if (result.modifiedCount > 0) {
          logservices.logger.info('Remove Sensors or Commands operation successfull')
          return res.status(200).send('')
        }
        else {
          logservices.logger.error('Remove Sensors or Commands operation failed: there is no such deviceid')
          return res.status(404).send({message:'there is no such deviceid '})
        }
      })
      .catch((err) => {
        logservices.logger.error('Remove Sensors or Commands operation failed ' + err.name)
        return res.status(403).send(JSON.stringify({error:err.name}))
      })
}

// add sensor or command route
exports.SensorsCommandsAdd = function (args, res, next) {
    let deviceid = args.swagger.params.deviceid.value
    route.addCommandOrSensor(args.body, deviceid)
      .then((result) => {
        if (result.modifiedCount > 0) {
          logservices.logger.info('Add Sensors or Commands operation successfull')
          return res.status(200).send('')
        }
        else {
          logservices.logger.error('Add Sensors or Commands operation failed: there is no such deviceid ')
          return res.status(404).send({message:'there is no such deviceid '})
        }
      })
      .catch((err) => {
        logservices.logger.error('Add Sensors or Commands operation failed: ' +  err.name)
        return res.status(403).send(JSON.stringify({error:err.name}))
      })
}

//start of deleting a particular device routing
exports.deviceDelete = function (args, res, next) {
    const obj = { deviceid: "" }
    obj.deviceid = args.swagger.params.deviceid.value
    route.RemoveDevice(obj)
        .then((result) => {
            if (result.deletedCount > 0) {
                logservices.logger.info('DeleteDevice from DB operation successfull')
                provision.DeprovisionDevice(obj.deviceid)
                    .then((response) => {
                        logservices.logger.info('DeleteDevice from IoTHuB operation successfull')
                        return res.status(200).send('')
                    })
                    .catch((err) => {
                        //create the same deviceid in the DB with the property "toberemoved" "
                        // repair the connection to the HUB and delete the deviceid again
                        obj.modus = "toberemoved"
                        route.InsertDevice(obj)
                        logservices.logger.error('DeleteDevice from the IoTHUB failed. Remove this deviceid manually')
                        return res.status(403).json({message:errormessage + 'Please conatct your main administrator to remove the device manually'})
                    })
            }
            else {
                logservices.logger.error('DeleteDevice from the DB failed. There is no such a device')
                return res.status(404).send({message:'there is no such a device'})
            }
        })
        .catch((err) => {
            logservices.logger.error('DeleteDevice from DB operation failed' + err.name)
            return res.status(403).send(JSON.stringify({error:err.name}))
        })
}


//start of getting a particular device routing
exports.deviceGet = function (args, res, next) {
    const obj = { deviceid: "" }
    obj.deviceid = args.swagger.params.deviceid.value
    //get device from the DB
    route.GetDevice(obj)
        .then((result) => {
            if (result == null) {
                logservices.logger.error('GetDevice operation failed, no such device')
                return res.status(404).send({ message: 'no such device' })
            }
            else {
                logservices.logger.info('GetDevice operation successfull')
                return res.status(200).send(result);
            }
        })
        .catch((err) => {
            logservices.logger.error('GetDevice operation failed ' + err.name)
            return res.status(403).send(JSON.stringify({error:err.name}))
        })
}