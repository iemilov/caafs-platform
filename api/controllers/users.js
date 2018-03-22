const auth = require("../helpers/auth");
const route = require("../helpers/users.db");
const bcrypt = require('bcryptjs')
const logservices = require("../helpers/logs")
const config = require("../config");

// generic admin user object
let genericAdmin = {
  username: 'admin@mail.com',
  name: 'Admin Admin',
  password: config.initialPassword,
  role: 'admin',
  phone: 1234567
}

// create admin after initial deployment and starting of the server
// this user can be deleted after the creating creating personal accounts
route.GetUser({username: 'admin@mail.com'})
  .then((result) => {
    if (result == null) {
      encrypt(genericAdmin)
      route.InsertUser(genericAdmin)
        .then((result) => {
          if (result.insertedCount > 0) {
            logservices.logger.info('Create intial Admin ' + genericAdmin.username + ' was successfull')
          }
        })
        .catch((err) => {
          logservices.logger.error('error occured on creating the initial admin ' + err.name)
        })
    }
  })
  .catch((err) => {
    logservices.logger.error('error occured on creating the initial admin ' + err.name)
  })


// encrypt the passwords for the user 
function encrypt(obj){
     bcrypt.hash(obj.password, 10, (err, hash) => {
         if (err) return err
         obj.password = hash
     })
}

// start of login routing
exports.loginPost = function (args, res, next) {
  const obj = { username: "" }
  obj.username = args.body.username
  route.GetUser(obj)
    .then((result) => {
      if (result == null) {
        logservices.logger.info('GetUser operation failed: no such user ' + obj.username)
        return res.status(404).send({ message: "no such user" })
      }
      else {
        const role = result.role
        const username = args.body.username
        const password = args.body.password
        bcrypt.compare(password, result.password, (err, response) => {
          if (err) return err;
          response === true
          if (username == result.username && response === true && role) {
            var tokenString = auth.issueToken(username, role);
            var response = { token: tokenString };
            res.writeHead(200, { "Content-Type": "application/json" })
            logservices.logger.info('Login operation was successfull ' + username)
            return res.end(JSON.stringify(response));
          } else {
            var response = { message: "Error: Credentials incorrect" }
            res.writeHead(403, { "Content-Type": "application/json" })
            logservices.logger.error('Login operation failed: Credentials incorrect ' + username)
            return res.end(JSON.stringify(response));
          }
        })
      }
    })
    .catch((err) => {
      logservices.logger.error('Login operation failed: ' + err.name)
      return res.status(403).send(JSON.stringify({error:err.name}))
    })
}

//get all users routing
exports.usersGet = function (args, res, next) {
  route.GetUsers()
    .then((result) => {
      for (var i = 0; i < result.length; i++){
        delete result[i].password
      }
      logservices.logger.info('UsersGet was successfull')
      return res.send(result);
    })
    .catch((err) => {
      logservices.logger.error(err.name)
      return res.status(403).send(JSON.stringify({error:err.name}))
    })
}

//start of creating user routing
exports.usersPost = function (args, res, next) {
  encrypt(args.body)
  route.InsertUser(args.body)
    .then((result) => {
      if (result.insertedCount > 0){
       logservices.logger.info('CreateUser was successfull')
       return res.status(201).send('')
      }
      else {
        logservices.logger.info('CreateUser operation failed. There is already a user with this username: ' + args.body.username)
        return res.status(409).send({message:'there is already a user with this username '})
      }
    })
    .catch((err) => {
      logservices.logger.error(err.name)
      return res.status(403).send(JSON.stringify({error:err.name}))
    })
}

//start of deleting user routing
exports.userDelete = function (args, res, next) {
  const obj = { username: "" }
  obj.username = args.swagger.params.username.value
  route.RemoveUser(obj)
    .then((result) => {
        if (result.deletedCount > 0){
         logservices.logger.info('DeleteUser was successfull')
         return res.status(200).send('')
        }
        else {
          logservices.logger.error('DeleteUser operation failed')
          return res.status(404).send({message:'no such user'})
        }
    })
    .catch((err) => {
      logservices.logger.error(err.name)
      return res.status(403).send(JSON.stringify({error:err.name}))
    })
}

//start of getting a particular user routing
exports.userGet = function (args, res, next) {
  const obj = { username: "" }
  obj.username = args.swagger.params.username.value
  route.GetUser(obj)
    .then((result) => {
      if (result == null) {
        logservices.logger.info('GetUser failed: no such user')
        return res.status(404).send({message:'no such user'})
      }
      else {
        delete result.password
        res.writeHead(200, { "Content-Type": "application/json" });
        logservices.logger.info('GetUser was successfull')
        return res.end(JSON.stringify(result));
      }
    })
    .catch((err) => {
      logservices.logger.error(err.name)
      return res.status(403).send(JSON.stringify({error:err.name}))
    })
}

//start of updating a particular user routing
exports.usersPut = function (args, res, next) {
  encrypt(args.body)
  let username = args.swagger.params.username.value
  route.UpdateUser(args.body, username)
    .then((result) => {
      if (result.modifiedCount > 0) {
        logservices.logger.info('UpdateUser was successfull')
        return res.status(200).send('')
      }
      else {
        logservices.logger.info('UpdateUser operation failed: no such user ' + args.body.username)
        return res.status(404).send({message:'no such user'})
      }
    })
    .catch((err) => {
      logservices.logger.error('UpdateUser operation failed: ' + err.name)
      return res.status(403).send(JSON.stringify({error:err.name}))
    })
}

