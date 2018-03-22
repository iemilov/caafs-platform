"use strict";

const express = require("express");
const http = require("http")
const socketIo = require("socket.io")
const port = process.env.PORT || 8001
const app = express()
const server = http.createServer(app);
const io = socketIo(server)

const swaggerTools = require("swagger-tools")
const YAML = require("yamljs")
const auth = require("./api/helpers/auth")
const swaggerConfig = YAML.load("./api/swagger/swagger.yaml")
const logservice = require("./api/helpers/logs")

// start the listener for live data
const listener = require("./api/livedata/listener")

swaggerTools.initializeMiddleware(swaggerConfig, (middleware) => {
  //Serves the Swagger UI on /docs
  //app.use(middleware.swaggerMetadata()); // needs to go BEFORE swaggerSecurity
  app.use(middleware.swaggerMetadata()); // needs to go BEFORE swaggerSecurity
  app.use(middleware.swaggerValidator())

  app.use(
    middleware.swaggerSecurity({
      //manage token function in the 'auth' module
      Bearer: auth.verifyToken
    })
  )
  
  var routerConfig = {
    controllers: "./api/controllers",
    useStubs: false
  }
  
  app.use(middleware.swaggerRouter(routerConfig))

  app.use(middleware.swaggerUi())

  // accept socket connections form remote web clients (for example web user interface)
  // the remote web client shall be authorized based on the token in the header
  io.on("connection", socket => {
    auth.TokenValidationWebClients(socket.handshake.query.token,  (response) => {
      if (response){
        console.log("New web client connected"),
        logservice.logger.info("New web client connected")
        //Subscribe for IoTHub events and send them to remote websocket
        SendEvents(socket)
        socket.on("disconnect", () => 
          logservice.logger.error("Web client disconnected")
        )
      }
      else {
        logservice.logger.error("Access Denied. You are not authorized to access this resource")
        console.log("Access Denied. You are not authorized to access this resource")
      }
    }) 
  })
  
  const SendEvents = async socket => {
    try {
      //Subscribe for events from the IoTHUB
      listener.livedata.on('IothubEvents', (data) => {
        console.log(JSON.stringify(data))
        socket.emit("sim", data.temperature)
      })
    }
    catch (error) {
      console.error(`Error: ${error.code}`);
      logservice.logger.error(`Error: ${error.code}`)
    }
  }
  
  server.listen(port, () => {
    console.log("Started server on port: " + port)
    logservice.logger.info("Started server on port: " + port)
  })
})


