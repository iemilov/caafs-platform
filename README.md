# Caarth - playground for building IoT solutions with Microsoft Azure

<img src="https://github.com/iemilov/GoIoT-Platform-Playground/blob/master/images/goiotAPI.png" style=" width:100px ; height:100px " />

**C.a.a.r.t.h** (Care and Alarms Rules Temperature Humidity) is a scalable web application for everyone who loves Node.js and is interested in learning Internet of Things, building demos, prototypes, showcases or just wants to try out quickly some use cases.
With this application you get a complete ready environment hosted in Microsoft Azure with the main functionalities which are major part of almost every solution. You are free configure parameters like database name, collections names, passwords,connection strings and etc. and there is no need to touch the code. Additionally there is a complete free suitable [DeviceClient](https://github.com/iemilov/GoIoT-Device-Client) application (written on Node.js) developed to communicate with this platform.
 
Please feel free to extend and make suggestions how to improve the application. If you find any bugs, do not hesitate to submit the issues: https://github.com/iemilov/GoIoT-Platform-Playground/issues

**Note**: After deploying and configuring the application you will get a similar result as the microsoft preconfigured solution announced here: https://github.com/Azure/azure-iot-pcs-remote-monitoring-dotnet, but with several differences:
 
1. In this case you won't get the environment ready with one mouse click, rather you will be able to deploy and configure the components on your own with the description provided here. You will get a very good impression which components are deployed and how to reconfigure them. The user will be free to choose even the free tier of every component as long it is possible for this resource.
2. This application is completly based on Node.js - easy to understand and extend even for user with modest programming background
3. The application uses the famous Express framework for exposing the APIs. You will be free to decide how to use those APIs and maybe create your own User Interface.
4. Currently not recommended for productive environments because of the fact that no tests like penetration or last tests are executed against the application.


Table of contents
=================

<!--ts-->
   * [Features Overview](#features-overview)
   * [Architecture Overview](#architecture-overview)
   * [Getting Started](#getting-started)
      * [Prerequisites](#prerequisites)
      * [Deploying and Configuration](#deploying-and-configuration)
      * [Run the application locally](#run-the-application-locally)
      * [Run the application on Azure](#run-the-application-on-azure)
   * [Running the tests](#running-the-tests)
   * [Usage](#usage)
   * [Contributing](#contributing)
   * [Authors](#authors)
   * [License](#license)   
<!--te-->

## Features Overview


1. **User Management**:
   - Authentication and Jwt token based authorization with Swagger and Node.js for users stored in Mongo DB databse
   - Distinguish between admin and user roles for accessing the protected resources
2. **Create devices/objects/sensors**
3. **Device Management**: reboot, firmwareUpdate, setNewInterval, uploadLogs, monitor, get metadata, get/create endnpoint, get command progress, execute waiting command. All those methods can be understood and executed by the device client application, which can be downloaded here: https://github.com/iemilov/GoIoT-Device-Client
4. **Set rules** - currently the following rules are implmeneted:
   - set threshold value for a particular object/device/sensor relation
   - set range - trigger rule if the sensor value get outside this range
   - track connection status - trigger rule if device get disconnected
   - store telemetry - choose to store only sensor data based on predifend conditions (delta values)
5. **Send email notifications using sendgrid** - https://sendgrid.com/
6. **Store alarms**
7. **Download Activity Logs**
8. **View statistic** -  number of connected device/objects, storem active/resolved alarms, sent notifications
9. **Telemtry** - filter data per object/device/sensor, get data in CSV format for further analytics

## Architecture Overview

<img src="https://github.com/iemilov/GoIoT-Platform-Playground/blob/master/images/architecture.png" style=" width:100px ; height:100px " />
 
## Getting Started
 
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. Before starting, the following azure resources should be deployed and configured:
 
### Prerequisites
 
* Azure subscription: https://azure.microsoft.com/en-us/free/
* Azure Table/Blob Storage
* Azure IoT HuB 
* Cosmos DB with Mongo DB API projections
* SendGrid Account
* Azure WebAPI with App Service plan
 
### Deploy and Configure

Step by step description to deploy and configure the required resources

1. [Create Resource Group](https://github.com/iemilov/Caarth-Platform-Playground/wiki#create-resource-group)
2. [Create and Configure Storage Account ](https://github.com/iemilov/Caarth-Platform-Playground/wiki#create-storage-account)
3. [Create and Configure Azure IoT Hub](https://github.com/iemilov/Caarth-Platform-Playground/wiki#azure-iot-hub)
4. [Create and Configure Azure Cosmos DB](https://github.com/iemilov/Caarth-Platform-Playground/wiki#azure-cosmos-db)
5. [Create and Configure Azure Sendgrid](https://github.com/iemilov/Caarth-Platform-Playground/wiki#azure-sendgrid)
6. [Create and Configure Azure API App](https://github.com/iemilov/Caarth-Platform-Playground/wiki#azure-api-app)

### Run the application locally

1. Install Node.js on your local machine: https://nodejs.org/en/download/
2. Clone the repository on your local machine

```
git clone https://github.com/iemilov/Caarth-Platform-Playground.git
```

3. Install the required node modules:
 
```
npm install
```
4. **Change the configuration parameters in [config.js](https://github.com/iemilov/Caarth-Platform-Playground/blob/master/api/config.js)**

Copy the whole content from config.js and store it separtely as backup. You will need it in this state for the final cloud deployment. But in order to start the application locally you should replace everywhere the "process.env" part with the real parameters created in the [configuratioon steps](https://github.com/iemilov/Caarth-Platform-Playground/wiki#create-storage-account). For example:

```
replace config.connectionString = process.env['endpointIoTHuB'] WITH config.connectionString = 'conn string from Step 9'
```

5. **Start the application**:
 
```
npm start
```

   If you have done everything correct, you should be able to access the API app on:

```
localhost:8001/docs
```

6. **Test the application**:
 
   After the initial deployment an admin username "admin@mail.com" is automatic created. In order to use the exposed APIs you will need to get a token first. Make a post request to http://localhost:8001/api/login. You are free to use any tool for testing RESTful APIs. If you want it to test it on the browser ogo to http://localhost:8001/docs/#!/Users/loginPost an put the following body in the authentication text box:

```
{
  "username": "admin@mail.com",
  "password": "intial password from Step 13 for the application settings and config.js"
}
```

In the response body you should get an answer:

```
{
        "token": "jwt token" //This token will expire in 24 hours
}
```

From now you can start using the other APIs by using the Authorization paramter in the Header for every request:

```
{
        Authorization: Bearer token you get form the Authentication request
}
```

### Run the application on Azure

1. Bring the config.js in the initial state with all "process.env" parameters

2. Deploy the code to the local git created in Step 14 from the configuration steps

```
git remote add apiapp <Git clone URL from Step 14>
git push apiapp master:master
```

Use the git credentials created in Step 14 from the Configuration steps

The first deployment can take sevral minutes. Once the deployment is finished you should be able to see your API app under the following url:

```
http(s)://NAMEOFYOURAPIAPP.azurewebsites.net/docs/
```
3. Login through the http://goiotapi.azurewebsites.net/api/login with the initial username and password

4. Get the token and start using the other APIs as described "Run the application locally"

**Note**: If you test the APIs on the Browser please be sure that you load the main url only with http// and not htpps// since you do not have the htpps certifactes on your local machine


## Running the tests
 
Currently no automated tests are implemented! It is on the project roadmap.
 
### E2E test
 
connect a real or simulated device with the platform
 
Explain what these tests test and why
 
```
Give an example
```
## Usage


## Contributing
 
Please read [CONTRIBUTING.md](#contributing.md) for details on our code of conduct, and the process for submitting pull requests to us.
 
## Authors
 
* **Ivan Emilov**

## License
 
This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details

 