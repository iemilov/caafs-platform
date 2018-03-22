const route = require("../helpers/alarms.db")
const logservices = require("../helpers/logs")

// helper function to convert the alarms from the table Storage in better format
function AlarmsCollection(result, objectName){
  let alarms = []
  let l = result.entries.length
  for (let i = 0; i<l; i++){
      let object = {
          object:Object.values(result.entries[i].PartitionKey)[1],
          alarmid:Object.values(result.entries[i].RowKey)[1],
          occured:Object.values(result.entries[i].Timestamp)[1],
          name:Object.values(result.entries[i].Alert)[0],
          event:Object.values(result.entries[i].Event)[0],
          reference:Object.values(result.entries[i].Reference)[0],
          status:Object.values(result.entries[i].status)[0],                  
      }
      if (objectName == null){
        alarms.push(object)
      }
      // push only alarms for a specific object
      if (object.object == objectName){
        alarms.push(object)
      }
  }
  return alarms
}

//get all alarms routing
exports.alarmsget = function (args, res, next) {
    route.GetAlarms()
        .then((result) => {
          if (result.entries.length !== 0){
            logservices.logger.info('Getting all alarms operation successfull')
            return res.send(AlarmsCollection(result, null));
          } else {
            return res.status(404).send({message:"there is no alarms"})
          }  
        })
        .catch((err) => {
            logservices.logger.error('Getting all alarms operation failed:' + err.message)
            return res.status(err.statusCode).send(JSON.stringify({error:err.message}))
        })
}

//get all alarms per object routing
exports.alarmget = (args, res, next) => {
  let objectName = args.swagger.params.object.value
  route.GetAlarmObject()
      .then((result) => {
          if (AlarmsCollection(result, objectName).length !== 0) {
            logservices.logger.info('Getting all alarms per object operation successfull')
            return res.send(AlarmsCollection(result, objectName)); 
          } else {
            return res.status(404).send({message:"there is no such object"})
          }
      })
      .catch((err) => {
          logservices.logger.error('Getting all alarms per object operation failed:' + err.message)
          return res.status(err.statusCode).send(JSON.stringify({error:err.message}))
      })
}

//start of getting a particular alarm (object and alarmid) routing
exports.getAlarmId = function (args, res, next) {
  let object = {
    object: args.swagger.params.object.value,
    alarmid: args.swagger.params.alarmid.value
  }
  route.GetAlarm(object)
    .then((result) => {
      logservices.logger.info('Getting alarm operation successfull')
      let alarm = {
        object:Object.values(result.PartitionKey)[1],
        alarmid:Object.values(result.RowKey)[1],
        occured:Object.values(result.Timestamp)[1],
        name:Object.values(result.Alert)[0],
        event:Object.values(result.Event)[0],
        reference:Object.values(result.Reference)[0],
        status:Object.values(result.status)[0], 
      }
      return res.send(alarm)
    })
    .catch((err) => {
      logservices.logger.error('Getting alarm operation failed:' + err.message)
      return res.status(err.statusCode).send(JSON.stringify({error:err.message}))
    })
}


//start of updating a particular alarm routing
exports.alarmput = function (args, res, next) {
  let alarm = args.body
  route.GetAlarm(alarm)
    .then((result) => {
      let currentEtag = result['.metadata'].etag
      route.UpdateStatusAlarm(alarm, currentEtag)
        .then((result) => {
          logservices.logger.info('Manually updating alarm operation successfull')
          return res.send('');
        })
        .catch((err) => {
          if (err.statusCode == 412) {
            logservices.logger.error('Manually updating alarm operation failed:' + err.message)
            return res.status(err.statusCode).send(JSON.stringify({ error: err.code + ', currently someone else is changing this resource ' }))
          } else {
            logservices.logger.error('Manually updating alarm operation failed:' + err.message)
            return res.status(err.statusCode).send(JSON.stringify({ error: err.message }))
          }
        })
    })
    .catch((err) => {
      logservices.logger.error('Get etag operation failed:' + err.message)
      return res.status(err.statusCode).send(JSON.stringify({ error: err.message }))
    })
}

//start of deleting particular alarm routing
exports.alarmdelete = function (args, res, next) {
  let object = {
    object: args.swagger.params.object.value,
    alarmid: args.swagger.params.alarmid.value
  }
  route.GetAlarm(object)
    .then((result) => {
      let currentEtag = result['.metadata'].etag
      route.DeleteAlarm(object, currentEtag)
        .then((response) => {
          logservices.logger.info('Deleting alarm operation successfull')
          return res.send('');
        })
        .catch((err) => {
          if (err.statusCode == 412) {
            logservices.logger.error('Manually updating alarm operation failed:' + err.message)
            return res.status(err.statusCode).send(JSON.stringify({ error: err.code + ', currently someone else is changing this resource ' }))
          } else {
            logservices.logger.error('Manually updating alarm operation failed:' + err.message)
            return res.status(err.statusCode).send(JSON.stringify({ error: err.message }))
          }
        })
    })
    .catch((err) => {
      logservices.logger.error('Get etag operation failed:' + err.message)
      return res.status(err.statusCode).send(JSON.stringify({ error: err.message }))
    })
    
};

//start of deleting picked several alarms routing
exports.alarmsdelete = function (args, res, next) {
    route.DeleteAlarms(args.body)
      .then((promises) => {
        logservices.logger.info('Deleting picked several alarms operation successfull')
        return res.send({message: promises.length + " alarms are removed"}); 
      })
      .catch((err) => {
        logservices.logger.error('Deleting picked several alarms operation failed:' + err.message)
        return res.status(err.statusCode).send(JSON.stringify({error:err.message}))
      })
}

//start of deleting all alarms per object routing
exports.alarmsObjectDelete = (args, res, next) => {
  let objectName = args.swagger.params.object.value
  route.GetAlarms()
    .then((result) => {
      if (AlarmsCollection(result, objectName).length !== 0) {
        route.deleteAlarmsObject(AlarmsCollection(result, objectName))
          .then((promises) => {
            logservices.logger.info('Deleting all alarms per object operation successfull')
            return res.send({ message: promises.length + " alarms are removed" });
          })
          .catch((err) => {
            logservices.logger.error('Deleting all alarms per object operation failed:' + err.message)
            return res.status(err.statusCode).send(JSON.stringify({error:err.message}))
          })
      } else {
        return res.status(404).send({ message: "there is no such object" })
      }
    })
    .catch((err) => {
      logservices.logger.error('Getting all alarms operation failed:' + err.message)
      return res.status(err.statusCode).send(JSON.stringify({error:err.message}))
    })
}

//start of deleting all existing alarms routing
exports.allAlarmsDelete = (args, res, next) => {
  route.GetAlarms()
    .then((result) => {
      if (AlarmsCollection(result, null).length !== 0) {
        route.removeAllAlarms(AlarmsCollection(result, null))
          .then((promises) => {
            logservices.logger.info('Deleting all alarms operation successfull')
            return res.send({ message: promises.length + " alarms are removed" });
          })
          .catch((err) => {
            logservices.logger.error('Deleting all alarms operation failed:' + err.message)
            return res.status(err.statusCode).send(JSON.stringify({error:err.message}))
          })
      } else {
        return res.status(404).send({ message: "there is no alarms" })
      }
    })
    .catch((err) => {
      logservices.logger.error('Getting all alarms operation failed:' + err.message)
      return res.status(err.statusCode).send(JSON.stringify({error:err.message}))
    })
}