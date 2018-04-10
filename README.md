# Caafs - playground for building IoT solutions with Microsoft Azure
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.me/IEmilov)
> *Copyright 2018 [Ivan Emilov]*

**C.a.a.f.s** (**Care and Alarms facility systems**) is cloud based IoT platform/playground that enables building demos, prototypes, showcases or rapidly customizing of different use cases. With **C.a.a.f.s**, you are able to:

* Provision and control devices/objects.
* Get simple statistic about devices/objects.
* Set filter to collect only delta data form devices/objects
* Consume live sensor data.
* Set Rules and trigger alarms.
* Send Notifcations based on the rules.
* Manage users.

<p align="center">
        <img src="https://github.com/iemilov/GoIoT-Platform-Playground/blob/master/images/caafs.jpg" style=" width:100px ;      height:100px " />
</p>


> More details about the application features can be found [here](https://github.com/iemilov/caafs-platform/wiki/Usage#features-overview).

**Applicable** for almost every industry but rather suitable and **ready to use** for the following real life use cases:
* Control facility systems based on threshold monitoring of sensor values
* Trend analysis based on automation triggers
* Notification of temperature irregularities for food services, technical equipment or pharmacy products (like vaccines)
* Notification of humidity irregularities in the plant industry

This web application is also apprpriate for everyone who loves Node.js, is interested in learning Internet of Things and wants to get familiar with Microsoft Azure. Additionally there is a complete free [DeviceClient](https://github.com/iemilov/GoIoT-Device-Client) application developed for this platform.
 
Please feel free to extend and make suggestions how to improve the application. If you find any bugs, do not hesitate to submit the [issues](https://github.com/iemilov/caafs-platform/issues)

**Note**:  Currently not recommended for production without doing penetration and load tests. Additional facts:

1. **based** on PaaS services -> low maintenance costs
2. **easy** to configure and administrate without touching the code -> [step by step description](https://github.com/iemilov/Caarth-Platform-Playground/wiki/Deploying-and-Configuration)
3. **scalable** -> on demand
4. **extendible** -> extent for commercial use for everyone who is familiar with Node.js
5. **open** -> every feature has its API based on Express framework: you are free to develop your own UI or mobile app
6. **secure** -> uses token based authorization



Table of contents
=================

<!--ts-->
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

## Architecture Overview

![architecture](https://github.com/iemilov/GoIoT-Platform-Playground/blob/master/images/architecture.png)

 
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

1. [Create Resource Group](https://github.com/iemilov/caafs-platform/wiki/Deploying-and-Configuration#create-resource-group)
2. [Create and Configure Storage Account ](https://github.com/iemilov/caafs-platform/wiki/Deploying-and-Configuration#create-storage-account)
3. [Create and Configure Azure IoT Hub](https://github.com/iemilov/caafs-platform/wiki/Deploying-and-Configuration#azure-iot-hub)
4. [Create and Configure Azure Cosmos DB](https://github.com/iemilov/caafs-platform/wiki/Deploying-and-Configuration#azure-cosmos-db)
5. [Create and Configure Azure Sendgrid](https://github.com/iemilov/caafs-platform/wiki/Deploying-and-Configuration#azure-sendgrid)
6. [Create and Configure Azure API App](https://github.com/iemilov/caafs-platform/wiki/Deploying-and-Configuration#azure-api-app)

### Run the application locally

1. **Install [Node.js](https://nodejs.org/en/download/) on your local machine.**
2. **Clone the repository on your local machine**

```
git clone https://github.com/iemilov/caafs-platform.git
```

3. **Install the required node modules**:
 
```
npm install
```
4. **Change the configuration parameters in [config.js](https://github.com/iemilov/Caarth-Platform-Playground/blob/master/api/config.js)**

Copy the whole content from config.js and store it separtely as backup. You will need it in this state for the final cloud deployment. But in order to start the application locally you should replace everywhere the "process.env" part with the real parameters created in the [configuratioon steps](https://github.com/iemilov/Caarth-Platform-Playground/wiki#create-storage-account). For example:

REAPLACE config.connectionString = process.env['endpointIoTHuB'] WITH config.connectionString = connection string from [Step 9](https://github.com/iemilov/caafs-platform/wiki/Deploying-and-Configuration#step-9-store-connection-string-for-iot-hub)


5. **Start the application**:
 
```
npm start
```

   If you have done everything correct, you should be able to access the API description on swagger UI on:

```
localhost:8001/docs
```

<img src="https://github.com/iemilov/GoIoT-Platform-Playground/blob/master/images/goiotAPI.png" style=" width:100px ; height:100px " />

6. **Test the application**:
 
After the initial deployment an admin username "**admin@mail.com**" is automatic created. In order to use the exposed APIs you will need to get a token first. Make a post request to http://localhost:8001/api/login. You are free to use any tool for testing RESTful APIs. If you want it to test it on the browser go to http://localhost:8001/docs/#!/Users/loginPost an put the following body in the authentication text box: use the **initialAdminPassword** created in [step 13](https://github.com/iemilov/caafs-platform/wiki/Deploying-and-Configuration#step-13-configure-application-parameters)

```
{
  "username": "admin@mail.com",
  "password": "intial password"
}
```

In the response body you should get an answer:

```
{
        "token": "jwt token" //This token will expire in 24 hours
}
```
The token expiration time can be changed in [auth.js](https://github.com/iemilov/caafs-platform/blob/master/api/helpers/auth.js) at the bottom of the file:

```
{
   exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
}
```

From now you can start using the other APIs by using the Authorization paramter in the Header for every request (see example below):

```
{
        Authorization: Bearer <token you got from the Authentication request>
}
```

### Run the application on Azure

1. **Bring the [config.js](https://github.com/iemilov/Caarth-Platform-Playground/blob/master/api/config.js) in the initial state with all "process.env" parameters**

2. **Deploy the code to the local git using the credentials created [in Step 14](https://github.com/iemilov/caafs-platform/wiki/Deploying-and-Configuration#step-14-create-local-git-for-the-azure-api-app) from the configuration steps (see example below)**

```
git remote add apiapp <Git clone URL from Step 14>
git push apiapp master:master
```

The first deployment can take several minutes. Once the deployment is finished you should be able to see your API app under the following url:

```
http(s)://NAMEOFYOURAPIAPP.azurewebsites.net/docs
```

3. **Login through the http://NAMEOFYOURAPIAPP.azurewebsites.net/api/login with the initial username:**admin@mail.com**  and the **initialAdminPassword** created in [step 13](https://github.com/iemilov/caafs-platform/wiki/Deploying-and-Configuration#step-13-configure-application-parameters)**

4. **Get the token and start using the other APIs as in [Run the application locally](#run-the-application-locally)**

**Note**: If you test the APIs on the Browser with the Swagger UI please be sure that you load the main url only with http:// and not https://. When using other tools like postman you can use https://


## Running the tests
 
Currently no automated tests are implemented! It is on the project roadmap.
 
## Usage

* [Connect real device to the platform](https://github.com/iemilov/caafs-platform/wiki/Manage-Devices)
* [Device Management](https://github.com/iemilov/caafs-platform/wiki/Device-Management)
* [Authenticate and authorize](https://github.com/iemilov/caafs-platform/wiki/Authentication-&-Authorization)
* [Manage Rules](https://github.com/iemilov/caafs-platform/wiki/Manage-Rules)
* [Manage Alarms](https://github.com/iemilov/caafs-platform/wiki/Manage-Alarms)
* [Manage telemetry data](https://github.com/iemilov/caafs-platform/wiki/Manage-Telemetry-data)
* [Get activity logs](https://github.com/iemilov/caafs-platform/wiki/Activity-Logs)
* [Get Statisctic](https://github.com/iemilov/caafs-platform/wiki/Statisctic-API)
* [Connect web client to consume live data](https://github.com/iemilov/caafs-platform/wiki/Connect-web-client)


## Contributing
 
Please read [CONTRIBUTING.md](https://github.com/iemilov/caafs-platform/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

**If you like my work, please consider [supporting me](https://www.paypal.me/IEmilov) for maintaining and developing this application.**


  <a href="https://www.paypal.me/IEmilov">
    <img src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" />
  </a>

 
## Authors
 
* Ivan Emilov
* Contact: goiot.dev@gmail.com

## License
 
This project is licensed under the ISC License - see the [LICENSE.md](https://github.com/iemilov/caafs-platform/blob/master/LICENSE) file for details

 