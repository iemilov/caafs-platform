const route = require("../helpers/rules.db");
const logservices = require("../helpers/logs")

//start of creating rule routing
exports.rulesPost = function (args, res, next) {
    route.InsertRule(args.body)
      .then((result) => {
        if (result.insertedCount > 0){
         logservices.logger.info('Create Rule operation was successfull')
         return res.status(201).send('')
        }
        else {
          logservices.logger.error('Create Rule operation failed: there is already such rule')
          return res.status(409).send('there is already either a rule with this name or something went wrong ')
        }
      })
      .catch((err) => {
        logservices.logger.error('Create Rule operation failed: ' + err.name)
        return res.status(403).send(err.name)
         
      })
}

//get all rules routing
exports.rulesGet = function (args, res, next) {
    route.GetRules()
      .then((result) => {
        logservices.logger.info('Get Rules operation was successfull')
        return res.send(result);
      })
      .catch((err) => {
        logservices.logger.error('Get Rules operation failed: ' + err.name)
        return res.status(403).send(JSON.stringify(err.name))
      })
};

//start of deleting rule routing
exports.rulesDelete = function (args, res, next) {
    const obj = { rulename: "" }
    obj.rulename = args.swagger.params.rulename.value
    route.RemoveRule(obj)
      .then((result) => {
          if (result.deletedCount > 0){
            logservices.logger.info('Delete Rule operation was successfull')
           return res.status(200).send('')
          }
          else {
            logservices.logger.error('Delete Rule operation failed: there is no such rule')
            return res.status(404).send({message:'there is no such a rule'})
          }
      })
      .catch((err) => {
        logservices.logger.error('Delete Rule operation failed: ' + err.name)
        return res.status(403).send(JSON.stringify(err.name))
      })
};

//start of getting a particular rule routing
exports.ruleGet = function (args, res, next) {
    const obj = { rulename: "" }
    obj.rulename = args.swagger.params.rulename.value
    route.GetRule(obj)
      .then((result) => {
        if (result == null) {
          logservices.logger.error('Get Rule operation failed: there is no such rule')
          return res.status(404).send({message:'no such rule'})
        }
        else {
          res.writeHead(200, { "Content-Type": "application/json" });
          logservices.logger.info('Get Rule operation was successfull')
          return res.end(JSON.stringify(result));
        }
      })
      .catch((err) => {
        logservices.logger.error('Get Rule operation failed: ' + err.name)
        return res.status(403).send(JSON.stringify(err.name))
      })
}

//start of updating a particular rule routing
exports.rulesPut = function (args, res, next) {
  let rule = args.swagger.params.rulename.value
    route.UpdateRule(args.body, rule)
      .then((result) => {
        if (result.modifiedCount > 0) {
          logservices.logger.info('Update Rule operation was successfull')
          return res.status(200).send('')
        }
        else {
          logservices.logger.error('Update Rule operation failed: there is no such rule')
          return res.status(404).send('there is no such rule')
        }
      })
      .catch((err) => {
        logservices.logger.error('Update Rule operation failed:' + err.name)
        return res.status(403).send(JSON.stringify(err.name))
      })
}

//start of adding an object to a rule routing
exports.addObjectPut = function (args, res, next) {
  let rule = args.swagger.params.rulename.value
    route.addObject(args.body, rule)
      .then((result) => {
        if (result.modifiedCount > 0) {
          logservices.logger.info('Add object to the rule operation was successfull')
          // add an empty body in order to update or add Lastmodified timestamp to the rule
          let body = {}
          route.UpdateRule(body, rule)
          .then((result) => {
            logservices.logger.info('Update timestamp after Add object to the rule operation was successfull')
            return res.status(200).send('')
          })
          .catch((err) => {
            logservices.logger.error('Update timestamp after Add object to the rule operation failed:' + err.name)
            return res.status(403).send("object successfully added but error occured while updating timestamp lastModified" + JSON.stringify(err.name))
          }) 
        }
        else {
          logservices.logger.error('Add object to the rule operation failed: there is no such rule')
          return res.status(404).send('there is no such rule')
        }
      })
      .catch((err) => {
        logservices.logger.error('Add object to the rule operation failed:' + err.name)
        return res.status(403).send(JSON.stringify(err.name))
      })
}

//start of adding an object to a rule routing
exports.removeObjectPut = function (args, res, next) {
  let rule = args.swagger.params.rulename.value
  route.removeObject(args.body, rule)
    .then((result) => {
      if (result.modifiedCount > 0) {
        logservices.logger.info('Remove object from the rule operation was successfull')
        // add an empty body in order to update or add Lastmodified timestamp to the rule
        let body = {}
        route.UpdateRule(body, rule)
          .then((result) => {
            logservices.logger.info('Update timestamp after Add object to the rule operation was successfull')
            return res.status(200).send('')
          })
          .catch((err) => {
            logservices.logger.error('Update timestamp after Add object to the rule operation failed:' + err.name)
            return res.status(403).send("object successfully removed but errror while updating timestamp lastModified" + JSON.stringify(err.name))
          })
      }
      else {
        logservices.logger.error('Remove object from the rule operation failed: there is no such rule')
        return res.status(404).send('there is no such rule')
      }
    })
    .catch((err) => {
      logservices.logger.error('Remove object from the rule operation failed:' + err.name)
      return res.status(403).send(JSON.stringify(err.name))
    })
}

//start of adding an email to a rule routing
exports.addMailPut = function (args, res, next) {
  let rule = args.swagger.params.rulename.value
  route.addMail(args.body, rule)
    .then((result) => {
      if (result.modifiedCount > 0) {
        logservices.logger.info('Add mail receiver to the rule operation was successfull')
        // add an empty body in order to update or add Lastmodified timestamp to the rule
        let body = {}
        route.UpdateRule(body, rule)
          .then((result) => {
            logservices.logger.info('Update timestamp after Add object to the rule operation was successfull')
            return res.status(200).send('')
          })
          .catch((err) => {
            logservices.logger.error('Update timestamp after Add object to the rule operation failed:' + err.name)
            return res.status(403).send("email successfully added but error occured while updating timestamp lastModified" + JSON.stringify(err.name))
          })
      }
      else {
        logservices.logger.error('Add mail receiver to the rule operation failed: there is no such rule')
        return res.status(404).send('there is no such rule')
      }
    })
    .catch((err) => {
      logservices.logger.error('Add mail receiver to the rule operation failed:' + err.name)
      return res.status(403).send(JSON.stringify(err.name))
    })
}

//start of removing an email to a rule routing
exports.removeMailPut = function (args, res, next) {
  let rule = args.swagger.params.rulename.value
  route.removeMail(args.body, rule)
    .then((result) => {
      if (result.modifiedCount > 0) {
        logservices.logger.info('Remove mail receiver from the rule operation was successfull')
        // add an empty body in order to update or add Lastmodified timestamp to the rule
        let body = {}
        route.UpdateRule(body, rule)
          .then((result) => {
            logservices.logger.info('Update timestamp after Add object to the rule operation was successfull')
            return res.status(200).send('')
          })
          .catch((err) => {
            logservices.logger.error('Update timestamp after Add object to the rule operation failed:' + err.name)
            return res.status(403).send("email successfully removed but error occured while updating timestamp lastModified" + JSON.stringify(err.name))
          })
      }
      else {
        logservices.logger.error('Remove mail receiver from the rule operation failed: there is no such rule')
        return res.status(404).send('there is no such rule')
      }
    })
    .catch((err) => {
      logservices.logger.error('Remove mail receiver from the rule operation failed:' + err.name)
      return res.status(403).send(JSON.stringify(err.name))
    })
}