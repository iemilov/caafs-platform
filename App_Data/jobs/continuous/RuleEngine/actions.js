const config = require("./config")
// create logservice
const helper = require("./helper")
//send email options
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(config.SENDGRID_API_KEY);

let PersistAlarmId = []


// check if there is already alarm for this object or device and use the generated rowkey in order to update the status
// assign key to the right rowkey
let key = ''
function inArray(data) {
    let length = PersistAlarmId.length
    for (var i = 0; i < length; i++) {
        if (PersistAlarmId[i].object == data) {
            key = PersistAlarmId[i].rowkey
            PersistAlarmId.splice( i, 1 )
            return true
        }
    }
}

//generate random id
function randId() {
   return  Math.floor((Math.random() * 100000).toString());
}

// pick and execute the right action
function ExecuteAction(actions, alarmobject, mailReceiver) {
    if (actions.alarm && alarmobject.status === 'active') {
        // add rowkey to the alarmobject and combinde it with the alarmid (alarmid is the deviceid)
        alarmobject.rowkey = randId() + '_' + alarmobject.alarmid
        let obj = {
            object: alarmobject.objectid,
            rowkey: alarmobject.rowkey
        }
        PersistAlarmId.push(obj)
        helper.StoreAalarm(alarmobject)
            .then((result) => {
                helper.logger.info('alarm storing opreration successfull')
            })
            .catch((err) => {
                helper.logger.error('stroing alarm failed: ' + err.message)
            })
    }

    if (actions.alarm && alarmobject.status === 'resolved' && inArray(alarmobject.objectid)) {
        // use the rowkey in order to update the status of the alarm
        alarmobject.rowkey = key
        helper.StoreAalarm(alarmobject)
        .then((result) => {
            helper.logger.info('alarm storing opreration successfull')
        })
        .catch((err) => {
            helper.logger.error('stroing alarm failed: ' + err.message)
        })
    }
    
    if (actions.notifyMail && alarmobject.status === 'active') {
        let message = config.template + ' occured. ' + config.text + 'object: ' + alarmobject.objectid + "<br>" + 'device: '  + alarmobject.alarmid + "<br>" + 'triggredRule: ' + alarmobject.name + "<br>"
        + 'event: ' + alarmobject.event + "<br>" + 'reference: ' + alarmobject.reference + "<br>" + 'status: ' + alarmobject.status + "<br><br>" +
        'Time: ' + new Date() + "<br><br>" + config.signature
        mailOptions.subject = config.subject + '🔥'
        runThroughMails (message, mailReceiver, alarmobject )
    }

    if (actions.notifyMail && alarmobject.status === 'resolved') {
        let message = config.template + ' resolved. ' + config.text + 'object: ' + alarmobject.objectid + "<br>" + 'device: '  + alarmobject.alarmid + "<br>" + 'triggeredRule: ' + alarmobject.name + "<br>"
        + 'event: ' + alarmobject.event + "<br>" + 'reference: ' + alarmobject.reference + "<br>" + 'status: ' + alarmobject.status + "<br>" + "<br>" + 
        'Time: ' + new Date() + "<br><br>" + config.signature
        mailOptions.subject = config.subject + '✅'
        runThroughMails (message, mailReceiver, alarmobject )
    }

    if (!(actions.alarm && actions.notifyMail)) {
        logservices.logger.error('no active actions. Please activate at least one of the actions!')
    }
}


// store telemetry message
function executeActionTelemtry(telemetryMessage){
    helper.storeTelemtry(JSON.stringify(telemetryMessage))
    .catch((err) => {
        helper.logger.error('stroing telemtry failed: ' + err.message)
    })
}

function runThroughMails (message, mailReceiver, alarmobject ){
    let l = mailReceiver.length
    for (var i=0; i<l; i++){
        mailOptions.to = mailReceiver[i].mail
        helper.logger.info(mailReceiver[i].mail)
        SendEmail(message)
        .then(() => {
            helper.logger.info('sending email to ' + mailOptions.to + ' was successfull')
            let noficationObj = {
                mail: mailOptions.to,
                rowkey: randId().toString(),
                status: alarmobject.status
            }
            helper.StoreNotifications(noficationObj)
            .then((result) => {
                helper.logger.info('notification storing opreration successfull')
            })
            .catch((err) => {
                helper.logger.error('notification stroing failed: ' + err.message)
            })
        })
        .catch((err) => {
            helper.logger.error('sending email to ' + mailOptions.to + ' failed: ' + err)
        })
    }
}

let mailOptions = {
    from: config.from,
    to: '',
    subject: config.subject,
}

function SendEmail(message) {
    mailOptions.html = message
    return new Promise((resolve, reject) => {
        sgMail.send(mailOptions, (err, json) =>{
            if (err) reject(err);
            else {
                resolve(json)
            }
        })
    })
}

module.exports = {
    ExecuteAction,
    executeActionTelemtry
} 