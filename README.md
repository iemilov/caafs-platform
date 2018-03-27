# Caafs - playground for building IoT solutions with Microsoft Azure

> *Copyright 2018 [Ivan Emilov]*

**C.a.a.f.s** (Care and Alarms facility systems) is cloud based IoT platform/playground that enables building demos, prototypes, showcases or rapidly customizing of different use cases. With C.a.a.f.s, you are able to:

* Provision and control devices/objects.
* Get simple statistic.
* Provision and control users.
* Collect and data from devices/objects.
* Set Rules and trigger alarms.
* Send Notifcations based on the rules.

Suitable for the following real life use cases:
* Control facility systems based on threshold monitoring of sensor values
* Trend analysis based on automation triggers
* Notification of temperature irregularities for food services, technical equipment or pharmacy products (like vaccines)
* Notification of humidity irregularities for plant industry

This web application is also apprpriate for everyone who loves Node.js, is interested in learning Internet of Things and wants to get familiar with Microsoft Azure. Additionally there is a complete free suitable [DeviceClient](https://github.com/iemilov/GoIoT-Device-Client) application developed for this platform.

<img src="https://github.com/iemilov/GoIoT-Platform-Playground/blob/master/images/goiotAPI.png" style=" width:100px ; height:100px " />

 
Please feel free to extend and make suggestions how to improve the application. If you find any bugs, do not hesitate to submit the issues: https://github.com/iemilov/GoIoT-Platform-Playground/issues

**Note**:  Currently not recommended for productive environments due to the fact that no tests like penetration or last tests are executed. Additional facts:

1. **based** on PaaS services
2. **easy** to configure and administrate without touching the code
3. **scalable** on demand
4. **easy** to extent for commercial use for everyone who is familiar with Node.js
5. **open**, every feature has its API based on Express framework



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

all details about the application features can be found [here](https://github.com/iemilov/Caarth-Platform-Playground/wiki/Usage#features-overview)

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

1. **Install Node.js on your local machine: https://nodejs.org/en/download/**
2. **Clone the repository on your local machine**

```
git clone https://github.com/iemilov/Caarth-Platform-Playground.git
```

3. **Install the required node modules**:
 
```
npm install
```
4. **Change the configuration parameters in [config.js](https://github.com/iemilov/Caarth-Platform-Playground/blob/master/api/config.js)**

Copy the whole content from config.js and store it separtely as backup. You will need it in this state for the final cloud deployment. But in order to start the application locally you should replace everywhere the "process.env" part with the real parameters created in the [configuratioon steps](https://github.com/iemilov/Caarth-Platform-Playground/wiki#create-storage-account). For example:

REAPLACE config.connectionString = process.env['endpointIoTHuB'] WITH config.connectionString = connection string from [Step 9](https://github.com/iemilov/Caarth-Platform-Playground/wiki#step-9-store-connection-string-for-iot-hub)


5. **Start the application**:
 
```
npm start
```

   If you have done everything correct, you should be able to access the API app on:

```
localhost:8001/docs
```

6. **Test the application**:
 
After the initial deployment an admin username "**admin@mail.com**" is automatic created. In order to use the exposed APIs you will need to get a token first. Make a post request to http://localhost:8001/api/login. You are free to use any tool for testing RESTful APIs. If you want it to test it on the browser go to http://localhost:8001/docs/#!/Users/loginPost an put the following body in the authentication text box: use the **initialAdminPassword** created in [step 13](https://github.com/iemilov/Caarth-Platform-Playground/wiki#step-13-configure-application-parameters)

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

From now you can start using the other APIs by using the Authorization paramter in the Header for every request:

```
{
        Authorization: Bearer <token you got from the Authentication request>
}
```

### Run the application on Azure

1. **Bring the config.js in the initial state with all "process.env" parameters**

2. **Deploy the code to the local git created [in Step 14](https://github.com/iemilov/Caarth-Platform-Playground/wiki#step-14-create-local-git-for-the-azure-api-app) from the configuration steps**

```
git remote add apiapp <Git clone URL from Step 14>
git push apiapp master:master
```

Use the git credentials created in Step 14 from the Configuration steps

The first deployment can take sevral minutes. Once the deployment is finished you should be able to see your API app under the following url:

```
http(s)://NAMEOFYOURAPIAPP.azurewebsites.net/docs/
```
3. **Login through the http://NAMEOFYOURAPIAPP.azurewebsites.net/api/login with the initial username and password**

4. **Get the token and start using the other APIs as in [Run the application locally](#run-the-application-locally)**

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

 