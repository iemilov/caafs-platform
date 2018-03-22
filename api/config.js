const config = {}

//authorizations config
//put here the token issuer web ui etc.
config.issuer = process.env['issuer']
// put a string to create a token secret
config.sharedSecret = process.env['sharedSecret']

// set admin for the intial login after inital deployment
config.initialPassword = process.env['initialAdminPassword']

// connection string to connect to the iothub
config.connectionString = process.env['endpointIoTHuB']
//set consumer group for consuming livedata
config.consumerGroupLive = process.env['consumergroupLiveData']

// endpoint to connect to mongoDB API projection of azure cosmos DB
config.endpoint = process.env['endpointDB']
config.collectionu = process.env['user.collection']
config.collectiond = process.env['devices.collection']
config.collectionr = process.env['rules.collection']

//table storage configurations
config.accountName = process.env['storageAccountName']
config.accountKey = process.env['storageAccountKey']

// set tables
config.alarms = process.env['tableName']
config.notifications = process.env['sentNotifications']

// set blob container fo the telemetry data
config.containerTelemetry = process.env['containerTelemetry']
config.fileTelemetry = process.env['fileTelemetry']
config.CSV = process.env['fileTelemetryCSV']

// platform  activity logs configuration blob storage
config.container = process.env['containerNameLogs']
config.logfile = process.env['fileNameLogs']

//blob storage configurations for device logs
config.container_devices = process.env['containerNameDeviceLogs']
config.blobname = process.env['fileNameDeviceLogs']

module.exports = config