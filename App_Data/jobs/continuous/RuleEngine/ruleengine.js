'use strict';

const helper = require("./helper");
const actionservice = require("./actions")
const conditions = require("./conditions")

const ruleset = []

function Rule(objects, rulename, condition, actions, activated, mailReceiver) {
    this.objects = objects
    this.rulename = rulename
    this.condition = condition
    this.actions = actions
    this.activated = activated
    this.mailReceiver = mailReceiver
}

function Alarm(object, id, alert, event, reference, status) {
    this.objectid = object
    this.alarmid = id
    this.name = alert
    this.event = event
    this.reference = reference
    this.status = status
}

function Telemetry(object, deviceid, sensor, value, timestamp) {
    this.objectid = object
    this.deviceid = deviceid
    this.sensor = sensor
    this.value = value
    this.timestamp = timestamp
}


let lastValue = ''

//data holder'if condition is already hit'
let IsAlreadyHit = []

function IfExists (object){
    const length = IsAlreadyHit.length
    for (var i = 0; i < length; i++) {
        if (IsAlreadyHit[i].deviceid == object.deviceid && IsAlreadyHit[i].rulename == object.rulename 
            && IsAlreadyHit[i].sensor == object.sensor ) {
            return true
        }
    }
}

function remove(object) {
    const length = IsAlreadyHit.length
    for (var i = 0; i < length; i++) {
        if (IsAlreadyHit[i].deviceid === object.deviceid && IsAlreadyHit[i].rulename == object.rulename &&
            IsAlreadyHit[i].sensor == object.sensor ) {
			IsAlreadyHit.splice(i, 1)
			break
        }
    }
}

//check which devices are in the rule and assign the object to the rule
let object = ''
function inRule(rule, value) {
    let length = rule.objects.length
    for (var i = 0; i < length; i++) {
        if (rule.objects[i].deviceid == value) {
            object = rule.objects[i].object
            return true
        }
    }
}

// add rule from DB and create a new rule object with based on generic rule pattern
const AddRule = (inputobject) => {

    let rule = new Rule(inputobject.objects,
        inputobject.rulename,
        inputobject.condition,
        inputobject.actions,
        inputobject.enable,
        inputobject.mailReceiver
    )

    const RulePattern = {
        condition: (event) => {
            conditions.ToLowerCase(event)
            let eventDeviceid = conditions.lookup(event, 'deviceid')[1]
            // check if the device id is in the rule and in the comming event
            if (inRule(rule, eventDeviceid) && rule.activated == true && event.hasOwnProperty(rule.condition.sensor)) {
                let EventValue = conditions.lookup(event, rule.condition.sensor)[1]
                CheckAndExecute(rule, event, EventValue, eventDeviceid)
            }
            if (inRule(rule, eventDeviceid) && rule.activated == true && !event.hasOwnProperty(rule.condition.sensor)) {
                CheckAndExecute(rule, event, null, eventDeviceid)            
            }
        }
    }
    ruleset.push(RulePattern)
}

// check the condition and execute the alarm
function CheckAndExecute (rule, event, EventValue, eventDeviceid){
    let referenceObject = {deviceid:eventDeviceid}
    
    switch (rule.condition.name) {
        case 'threshold':
            referenceObject.rulename = rule.rulename
            referenceObject.sensor = rule.condition.sensor

            if (!IfExists(referenceObject) && conditions.operators[rule.condition.operator](EventValue, rule.condition.value)) {
                let Alert = new Alarm(object, eventDeviceid, rule.rulename, EventValue, rule.condition.value, 'active')
                // push the relation deviceid/rulename as reference: the condition for this device in relation with the rulename is already hit
                IsAlreadyHit.push(referenceObject)
                actionservice.ExecuteAction(rule.actions, Alert, rule.mailReceiver)
            }
            if (!conditions.operators[rule.condition.operator](EventValue, rule.condition.value) &&
                IfExists(referenceObject) && 
                EventValue !== null) {
                let Alert = new Alarm(object, eventDeviceid, rule.rulename, EventValue, rule.condition.value, 'resolved')
                // remove the relation deviceid/rulename from the stack. The upper if condition can now wait for the next hit
                remove(referenceObject)
                actionservice.ExecuteAction(rule.actions, Alert, rule.mailReceiver)
                
            }
            break
        case "range":
            referenceObject.rulename = rule.rulename
            referenceObject.sensor = rule.condition.sensor

            if (conditions.range(rule.condition.from, rule.condition.to, EventValue) && !IfExists(referenceObject)) {
                let Alert = new Alarm(object, eventDeviceid, rule.rulename, EventValue, 'from ' + rule.condition.from + ' to ' + rule.condition.to, 'active')
                // push the relation deviceid/rulename as reference: the condition for this device in relation with the rulename is already hit
                IsAlreadyHit.push(referenceObject)
                actionservice.ExecuteAction(rule.actions, Alert, rule.mailReceiver)
            }
            if (!conditions.range(rule.condition.from, rule.condition.to, EventValue) && 
                IfExists(referenceObject) &&
                EventValue !== null) {
                let Alert = new Alarm(object, eventDeviceid, rule.rulename, EventValue, 'from ' + rule.condition.from + ' to ' + rule.condition.to, 'resolved')
                // remove the relation deviceid/rulename from the stack. The upper if condition can now wait for the next hit
                remove(referenceObject)
                actionservice.ExecuteAction(rule.actions, Alert, rule.mailReceiver)
            }
            break
        case "connectionstatus":
            referenceObject.rulename = rule.rulename

            if (conditions.ConnectionStatus(event) && !IfExists(referenceObject)) {
                let Alert = new Alarm(object, eventDeviceid, rule.rulename, event.status, rule.condition.status, 'active')
                // push the relation deviceid/rulename as reference: the condition for this device in relation with the rulename is already hit
                IsAlreadyHit.push(referenceObject)
                actionservice.ExecuteAction(rule.actions, Alert, rule.mailReceiver)
            }
            if (!conditions.ConnectionStatus(event) && IfExists(referenceObject)) {
                let Alert = new Alarm(object, eventDeviceid, rule.rulename, event.status, rule.condition.status, 'resolved')
                // remove the relation deviceid/rulename from the stack. The upper if condition can now wait for the next hit
                remove(referenceObject)
                actionservice.ExecuteAction(rule.actions, Alert, rule.mailReceiver)
            }
            break

        case "telemetry":
            if (conditions.storeDelta(EventValue, lastValue, rule.condition.delta) && EventValue !== null){
                let telemetryMessage = new Telemetry(object, eventDeviceid, rule.condition.sensor, EventValue, new Date() )
                lastValue = EventValue 
                actionservice.executeActionTelemtry(telemetryMessage)
            } 
            break
    }
}

//check if the rule was modified in the last 5 seconds
function IsModified(ArrayOfObjects) {
    const length = ArrayOfObjects.length
    for (var i = 0; i < length; i++) {
        if ('LastModified' in ArrayOfObjects[i] 
        && new Date() - ArrayOfObjects[i].LastModified < 5000) {
            return true
        }
    }
}

// empty every time the ruleset and populate it again if the ruleset has been changed in the last 5 seconds
function ResetRuleset (ArrayOfObjects){
    ruleset.length = 0
    const length = ArrayOfObjects.length
    for (var i = 0; i < length; i++) {
        AddRule(ArrayOfObjects[i])
    }
}

// load rules from DB and populate the rulset
function GetRulesfromDB() {
    helper.getRules()
        .then((result) => {
            var currentlength = result.length
            //check if there are new changes in the ruleset
            if (currentlength != ruleset.length || IsModified(result)) {
                ResetRuleset(result)
                helper.logger.info("Ruleset was reseted successfully")
            } 
        })
        .catch((err) => {
            helper.logger.error("Getting data from the DB (rule engine) failed: " + err.message )
        })
}

// populate the ruleset with the generic function AddRule
const RuleEngine = {
    execute: function (event) {
        const rules = ruleset.length
        for (let i = 0; i < rules; i++) {
            if (event.hasOwnProperty('body')){
                ruleset[i].condition(event.body)
            } else {
                ruleset[i].condition(event)
            }
        }
    }
}

//ask the DB for rulset changes every 5 seconds
setInterval ( () => {
    GetRulesfromDB()
}, 5000 )


module.exports = {
    RuleEngine
}
