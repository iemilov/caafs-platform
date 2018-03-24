# GoIoT - playground for building IoT solutions with Microsoft Azure

<img src="https://github.com/iemilov/GoIoT-Platform-Playground/blob/master/images/goiotAPI.png" style=" width:100px ; height:100px " />

GoIoT is a scalable web application for everyone who loves Node.js and is interested in learning Internet of Things, building demos, prototypes, showcases or just wants to try out quickly some use cases.
With this application you get a complete ready environment hosted in Microsoft Azure with the main functionalities which are major part of almost every solution. You are free configure parameters like database name, collections names, passwords,connection strings and etc. and there is no need to touch the code. Additionally there is a complete free suitable [DeviceClient](#https://github.com/iemilov/GoIoT-Device-Client) device client application (written on Node.js) developed to communicate with this platform.
 
Please feel free to extend and make suggestions how to improve the application. If you find any bugs, do not hesitate to submit the issues: https://github.com/iemilov/GoIoT-Platform-Playground/issues

**Note**: After deploying and configuring the application you will get a similar result as the microsoft preconfigured solution announced here: https://github.com/Azure/azure-iot-pcs-remote-monitoring-dotnet, but with several differences:
 
1. In this case you won't get the environment ready with one mouse click, rather you will be able to deploy and configure the components on your own with the description provided here. You will get a very good impression which components are deployed and how to reconfigure them. The user will be free to choose even the free tier of every component as long it is possible for this resource.
2. This application is completly based on node js - easy to understand and extend even for user with modest programming background
3. The application uses the famous express framework for exposing the APIs. You will be free to decide how to use those APIs and maybe create your own user interface.
4. Currently not recommended for productive environments because of the fact that no tests like penetration or last tests are executed against the application.


Table of contents
=================

<!--ts-->
   * [gh-md-toc](#gh-md-toc)
   * [Table of contents](#table-of-contents)
   * [Installation](#installation)
   * [Usage](#usage)
      * [STDIN](#stdin)
      * [Local files](#local-files)
      * [Remote files](#remote-files)
      * [Multiple files](#multiple-files)
      * [Combo](#combo)
      * [Auto insert and update TOC](#auto-insert-and-update-toc)
   * [Tests](#tests)
   * [Dependency](#dependency)
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
 
### Deploying and Configuration

Once you got your azure free account, you can start deploying and configuring the required resources:

**Note**: before starting keep in mind that you should create all resources in the same geographical region in order to save outband costs and to use the bandwith as effective as possible!

#### 1. Create resource group:
A resource group is a container for all your resources which are to be deployed in the furthere steps:
https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-template-deploy-portal#create-resource-group

#### 2. Create Storage Account - https://docs.microsoft.com/en-us/azure/storage/common/storage-create-storage-account

What is the storage account for?

* store alarms and sent notifications in table storage
* store telemetry data, device logs and platform logs in blob container

Once you have successfully deployed the storage account within your azure subscription you can start with configuring it:

**Step 1 Create alarm table** - open yout storage account resource in the azure portal --> go to tables --> go to the plus symbol and create table. Give a name for the table where the application will store all alarms (for example "alarms")

**Step 2 Create sent notifications table** - create another table where the application will store all sent notifications for statistic purposes.

More details about azure table storage: https://docs.microsoft.com/en-us/azure/cosmos-db/table-storage-overview

**Step 3 Create container platform logs** -  from the portal again --> go to blobs --> go to plus symbol and create container with access level private for storing all the platform logs (example "platform-logs")

**Step 4 Create container device logs** - create container for device logs(for example "devicelogs")

**Step 5 Create endpoint for telemetry data** - create container for storing of all sensor data coming from the objects/devices (example name telemetry). Create a file within this container which will hold all telemetry data ( example name telemetry.json)

**Step 6 Store account key** - store the firts key from the example below - you will need it for the application settings

<img src="https://github.com/iemilov/GoIoT-Platform-Playground/blob/master/images/accountkey.png" style=" width:100px ; height:100px " />

In order to simplify the future work with the storage accounts it is recommended to use the azure storage explorer:
https://azure.microsoft.com/en-us/features/storage-explorer/

#### 3. Azure IoT Hub - https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-create-through-portal

Pricing - in order to get impression of the platform would be enough to choose free tier 8000 messages per day.

What are the consumer groups for?
Distributing the load accross the services which are responsible for processing the incomming messages:
- 1st consumergroup: used the service which listens to live events
- 2nd consumer group: used by the services which triggers rules events

**Step 7 Create consumer Groupes** - add 2 consumer groups: https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-features. 
Once you created the iot hub go to iothub resource via the portal --> endpoints --> Built-in endpoints --> events --> add the name of the consumer group for the RulesEngine (for example rules) under 'consumer groups' and store it. Repeat this action and create another consumer group fo the livedata.

**Step 8 Activate File Upload** - https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-file-upload
go to the File Upload --> click on the field Azure Storage container and choose the storage account name together with the container name for your devicelogs created in Step 4 --> save the settings

see example here: https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-csharp-csharp-file-upload

**Step 9 Store connection string for IoT Hub** - you will need this connection string for the application settings.

Find the connection string: https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-csharp-node-device-management-get-started

#### 4. Azure Cosmos DB - https://docs.microsoft.com/en-us/azure/cosmos-db/create-sql-api-nodejs

You can create this database using the description in the provided link. Comapared to the example you should choose mongo DB as API and not SQL.

What is the MongoDB for?

* store users documents in extra collection
* store objects/devices/sensors realtions in extra collection
* store rules documents in extra collection

Once you have successfully deployed the resource within your azure subscription you can start with configuring it:

**Step 10 Create database** - go to created resource via the portal --> go to collections and click on browse --> click on add Database --> give a name of your database --> click OK

**Step 11 Create collections** - after successfully creating the database --> go to add collection --> choose the created database in the previous step --> give a collection name (for example users) --> choose storage capacity 10GB and put 400 in the throughput field to save costs. You should execute this step 3 times in order to create 3 collections (users, devices, rules)

**Step 12 Get MongoDb connection string** - you will need this connection string for the application settings. In this case you should add the created database name (Step 10) to the connection string. The final connection string should look like the example below: The capital letters in the example shows the position wehere to place the database name

```
mongodb://examplename:xyz==@examplename.documents.azure.com:10255/DATABASENAME?ssl=true&replicaSet=globaldb
```
Find the connection string: https://docs.microsoft.com/en-us/azure/cosmos-db/connect-mongodb-account

**Note**: you can also use your own MongoDb database, for example on premise if you have your own datacenter.

#### 5. Azure Sendgrid - https://docs.microsoft.com/en-us/azure/sendgrid-dotnet-how-to-send-email

Pricing - choose free tier 2500 mails/month

What is the SendGrid for?
Sendgrid is a third party service for sending emails.
  
Once you have successfully deployed the sendgrid resource you only need to generate and store the API key as described in the provided example

#### 6. Azure API app

What is the API APP for?

This is the resource which you will deploy the code to: go to azure portal and click create resource --> write API App in the search field --> click on create --> enter the name of the your application --> choose your subscription and the resource group created in the beginning --> choose free service plan F1, location and give it a name --> leave Applications insights off and create the resource.

Once you have successfully deployed the API app within your azure subscription you can start with configuring the parameter:

**Step 13 Configure application parameters** - Go to the created API app resource --> Settings --> Application settings and enter the following parameters step by step <key> <value>.

**All parameters in left fields in bold (keys) font should be named exactly as the description below. The values are either free to choose or depends on the names created on the prvious steps**

Example: <img src="https://github.com/iemilov/GoIoT-Platform-Playground/blob/master/images/applicationsettings.png" style=" width:100px ; height:100px " />

* node version: **WEBSITE_NODE_DEFAULT_VERSION**: 8.9.3
* token issuer: **issuer**: your-web-ui.com (free to choose)
* shared secret: **sharedSecret**: cfee02d6-c137-11e5-8d731f2d1e2e67df-welcome-on-board-goiot-true (free to choose)
* endpoint IoT Hub: **endpointIoTHuB**: IoT hub connection string from Step 9
* enter consumer 1st group: **consumergroupRules**: the consumer group for rules created in Step 7
* enter consumer 2nd group: **consumergroupLiveData**: the consumer group for live data created also in Step 7 
* connection database: **consumergroupLiveData**: mongoDb connection string created in Step 12
* users collection: **user.collection**: users collection created in Step 11
* devices collection: **devices.collection**: devices collection created in Step 11
* rules collection: **rules.collection**: rules collection created in Step 11
* storage account name: **storageAccountName**: name of the created storage account at the beginning
* storage account key: **storageAccountKey**: the account key from Step 6
* table alarm: **tableName**: tabale name for alarms created in Step 1
* table sentNotifications: **sentNotifications**: tabale name created in Step 2
* container platform logs: **containerNameLogs**: container name created in Step 3
* file platform logs: **fileNameLogs**: platform (free to choose)
* container device logs: **containerNameDeviceLogs**: devicelogs container name created in Step 4
* sendgrid: **sendgrid**: enter the API key created through the sendgrid environment
* sender email: **fromField**: enter an arbitary sender email address (free to choose)
* email subject: **mailSubject**: enter an arbitary email subject (for example Alert)
* email subject: **mailTemplate**: enter an arbitary email template, for example Hi, a new alert is, (free to choose)
* email text: **mailText**: enter an arbityry text(example: Please pay attention on the following object:)
* email signature: **mailSignature**: arbitary email signature (example: Thanks for choosing our team, The Team Name)
* telemetry container: **containerTelemetry**: container name created in Step 5
* telemetry file: **fileTelemetry**: enter filename for telemetry data (for example telemetry.json)
* set file name device logs: **fileNameDeviceLogs**: enter filename ending for device logs (for example /logs.txt)
* telemetry CSV: **fileTelemetryCSV**: enter filename for CSV telemetry data (for example telemetry.csv)
* initial password: **initialAdminPassword**: enter an arbittary password for intial user (for example 46ag52c8z9)

**Note**: Please be aware that the RulesEngine together with the StoreTelemetry service are running as continious CRON jobs within the application. In general The "Always on options" within the Application settings should be activated if you have continious running WebJobs like in this case. If you want to activate it, you should upgrade the App Service plan to Standrard. In the case of using the free plan as recommended in this description the WebJobs will go from time to time down after the application have been idle.

Once you entered the final apllication setting you are ready to deploy your code. Before doing that, one additional step should be executed:

**Step 14 Create LocalGit within the Azure API app**

* Go to the API app resource via the portal
* Under Deployment, cick Deployment credentials
The Deployment credentials blade provides FTP credential settings that you need in order to deploy your site via FTP. Since Git and FTP can't authenticate using your Azure account information, you will be creating a new username and password that Git and FTP can use when deploying code to your Azure subscriptions
* In the FTP/deployment username textbox, enter the username that you want to use
* In the password and Confirm password textboxes, enter the password that you want to use
* At the top of the blade, to save your changes, click Save
* On the left side menu, click on Deployment Options
* On the Deployment source blade, click Source, and the click Local Git Repository
* Click OK to save the changes
* On the left menu go to Overview and store the Git Clone Url. The url should looke like:
```
https://YOURUSERNAME@API_APP_NAME.scm.azurewebsites.net:443/API_APP_NAME.git
```

### Run the application locally

1. Install node js on your local machine: https://nodejs.org/en/download/
2. Clone the repository on your local machine

```
git clone https://github.com/iemilov/GoIoT-Platform-Playground.git
```

3. Install the required node modules:
 
```
npm install
```
4. Change the configuration parameters in config.js: https://github.com/iemilov/GoIoT-Platform-Playground/blob/master/api/config.js

Copy the whole content from config.js and store it separtely as backup. You will need it in this state for the final cloud deployment. But in order to start the application locally you should replace everywhere the "process.env" part with the real parameters created in the configuratioon steps. For example:

```
replace config.connectionString = process.env['endpointIoTHuB'] WITH config.connectionString = 'conn string from Step 9'
```

5. Start the application:
 
```
npm start
```

If you have done everything correct, you should be able to access the API app on:

```
localhost:8001/docs
```

6. Test the application:

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
 
## Contributing
 
Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.
 
## Versioning
 
We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).
 
## Authors
 
* **Ivan Emilov** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)
 
See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.
 
## License
 
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
 
## Acknowledgments
 
* Hat tip to anyone who's code was used
* Inspiration
* etc
 