
const logservice = require("../helpers/logs")


//start of getting logs for a particular device
exports.getActivity = function (args, res, next) {
    logservice.getPlatformLogs()
        .then((fileName) => {
            logservice.logger.info('Download activity logs operation executed successfully')
            res.download(fileName)
            res.on('finish', function() {
                logservice.logger.info('The requested file' + fileName + 'was temporary stored on the express server and removed successfull')
                logservice.removeBlob(fileName)
            })
        })
        .catch((err) => {
            logservice.logger.error('Download oactivity logs operation failed:' + err.name)
            return res.status(403).send({ error: err.name })
        })
}