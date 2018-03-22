const config = {}

// connection string to connect to the iothub
config.connectionString = process.env['endpointIoTHuB']
//set consumer group for the rule engine
config.consumerGroupRules = process.env['consumergroupRules']

// endpoint to connect to mongoDB API projection of azure cosmos DB
config.endpoint = process.env['endpointDB']
config.collectionr = process.env['rules.collection']
config.collectiond = process.env['devices.collection']

//table storage configurations
config.accountName = process.env['storageAccountName']
config.accountKey = process.env['storageAccountKey']

// set table
config.alarms = process.env['tableName']
config.notifications = process.env['sentNotifications']

// set blob container fo the telemetry data
config.containerTelemetry = process.env['containerTelemetry']
config.fileTelemetry = process.env['fileTelemetry']

// platform logs configuration blob storage
config.container = process.env['containerNameLogs']
config.logfile = process.env['fileNameLogs']

//configurations for the mail notifications, getting alerts
config.SENDGRID_API_KEY = process.env['sendgrid']
config.from = process.env['fromField']
// set subject for the mail
config.subject = process.env['mailSubject']
// Cretae tmeplate for emial message
config.template = process.env['mailTemplate']
config.text = process.env['mailText']
config.signature = process.env['mailSignature']
config.time = new Date()


module.exports = config