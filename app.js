"use strict";

const express = require("express");
const http = require("http")
const socketIo = require("socket.io")
const port = process.env.PORT || 3000
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

// Add headers to allow access from different web user interfaces
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
})

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
  
  let clients = {}
    
  // accept socket connections form remote web clients (for example web user interface)
  // the remote web client shall be authorized based on the token in the header
  io.on("connection", socket => {
    io.set('transports', ['websocket']);
    clients[socket.id] = socket
    
    auth.TokenValidationWebClients(socket.handshake.query.token,  (response) => {
      if (response){
        console.log("New web client " + JSON.stringify(socket.handshake.headers.origin)+ " connected"),
        logservice.logger.info("New web client " + JSON.stringify(socket.handshake.headers.origin)+ " connected")
        //Subscribe for IoTHub events and send them to remote websocket
        SendEvents(socket)
        socket.on("disconnect", () => 
          console.log("Web client " + JSON.stringify(socket.handshake.headers.origin) + " disconnected"),
          logservice.logger.error("Web client " + JSON.stringify(socket.handshake.headers.origin)+ " disconnected"),
          delete clients[socket.id],
          socket.removeAllListeners()
        )
      }
      else {
        logservice.logger.error("Access Denied. An unauthorized web client " + JSON.stringify(socket.handshake.headers.origin))
        console.log("Access Denied. An unauthorized web client " + JSON.stringify(socket.handshake.headers.origin) +  " is trying to access live data")
      }
    })
  })
  
  const SendEvents = async socket => {
    try {
      listener.livedata.removeAllListeners()
      console.log("Iot Hub listener are cleared "),
      //Subscribe for events from the IoTHUB
      listener.livedata.on('IothubEvents', (data) => {
        //console.log(JSON.stringify(data))
        socket.emit("sim", JSON.stringify(data))
        listener.livedata.on("disconnect",function(data){
          listener.livedata.removeAllListeners()
        })
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


