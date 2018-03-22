# GoIoT - playground for building IoT solutions with Microsoft Azure

<img src="https://github.com/iemilov/GoIoT-Platform-Playground/blob/master/images/goiotAPI.png" style=" width:100px ; height:100px " />

GoIoT is a scalable web application for everyone who loves node js and is interested in learning Internet of Things, building demos, prototypes, showcases or just wants to try out quickly some use cases.
With this application you will be able to get a complete ready environment hosted in Microsoft Azure with the main functionalities which are major part of almost every solution.
It is up to you to choose the main configurations for the application like database name, collections names, passwords, connection strings and etc. and it can be configured without touching the code of the application.
Additionally there is a complete free suitable device client application developed to communicate with this platform and also written in node js.
 
Every user is free to extend and make suggestions how to improve the application. If you find any bugs, feel free to submit the issues: https://github.com/iemilov/GoIoT-Platform-Playground/issues

!!! After deploying and configuring the application you will get a similar result as the microsoft preconfigured solution announced here: https://github.com/Azure/azure-iot-pcs-remote-monitoring-dotnet, but with several differences:
 
1. In this case you won't get the environment ready with one mouse click, rather you will be able to deploy and configure the components on your own with the description provided here. You will get a very good impression which components are deployed and how to reconfigure them. The user will be free to choose even the free tier of every component as long it is possible for this resource.
2. This application is completly based on node js - easy to understand and extend even for user with modest programming background
3. The application uses the famous express framework for exposing the APIs. You will be free to decide how to use those APIs and maybe create your own user interface.
4. Currently not recommended for productive environments because of the fact that no tests like penetration or last tests are executed against the application.
 
## Features Overview

1. User Management:
        * Authentication and jwt token based authorization with Swagger and Node.js againts users stored in Mongo DB databse
  * admin and user roles for accessing the protected resources 
2. Create devices/objects/sensors
3. Device Management: reboot, firmwareUpdate, setNewInterval, uploadLogs, monitor, get metadata, get/create endnpoint, get command progress, execute waiting command. All those methods can be understood and executed by the device client application, which can be downloaded here: https://github.com/iemilov/GoIoT-Device-Client
4. set rules - currently the following rules are implmeneted:
  * set threshold value for a particular sensor
  * set range - trigger rule if the sensor value get outside this range
  * track connection status - trigger rule if device get disconnected
  * store telemetry - choose to store only sensor data based on predifend condition (delta values)
5. Send email notifications using sendgrid - https://sendgrid.com/
6. Store alarms
7. Download Activity Logs
8. View statistic -  number of connected device/objects, storem active/resolved alarms, sent notifications
9. Telemtry - filter data per object/device/sensor, get data in CSV format for further analytics

 
## Getting Started
 
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.
 
### Prerequisites
 
Azure subscription
Azure IoT HuB
Mongo Database
Azure Storage
Azure WebAPI with App Service plan
SendGrid Account
 
 
```
Give examples
```
 
### Installing
 
A step by step series of examples that tell you have to get a development env running
 
1. Configure the deployed Azure resources
        .
2. Deploy the web application
        . git clone
3. Test your deployment
 
```
Give the example
```
 
And repeat
 
```
until finished
```
 
##### Running locally
 
##### Running on the cloud
 
End with an example of getting some data out of the system or using it for a little demo
 
## Running the tests
 
Currently no automated tests are implemented! It is on the project roadmap.
 
### End to End
 
connect a real or simulated device with the platform
 
Explain what these tests test and why
 
```
Give an example
```
 
### And coding style tests
 
Explain what these tests test and why
 
```
Give an example
```
 
 
## Contributing
 
Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.
 
## Versioning
 
We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).
 
## Authors
 
* **Billie Thompson** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)
 
See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.
 
## License
 
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
 
## Acknowledgments
 
* Hat tip to anyone who's code was used
* Inspiration
* etc
 
 
Best Regards,
Ivan Emilov
T-Systems International GmbH
Digital Division - Digital Design & Development
Platform Development
Pascalstraße 11, 10587 Berlin
+49 15126049573  (Mobil)
E-Mail: ivan.emilov@t-systems.com
Internet: http://www.t-systems.de
 
Die gesetzlichen Pflichtangaben finden Sie unter: 
www.t-systems.de/pflichtangaben
 
Hinweis: Diese E-Mail und/oder die Anhänge sind vertraulich und ausschließlich für den bezeichneten Adressaten bestimmt. Die Weitergabe oder Kopieren dieser E-Mail ist strengstens verboten. Wenn Sie diese E-Mail irrtümlich erhalten haben, informieren Sie bitte unverzüglich den Absender und vernichten Sie die Nachricht und alle Anhänge. Vielen Dank.
Große Veränderungen fangen klein an – Ressourcen schonen und nicht jede E-Mail drucken.