# Attendance
This free Reference App is built to provide a use case example of the Aerohive APIs.
This App is providing a simple view of the connections history of users. All the data are anonymized in this case.

This application is publicly available [here](https://attendance.ah-lab.fr) (You will need a HiveManager NG account).
![attendance](https://github.com/tmunzer/attendance/blob/master/attendance.png?raw=true)

## Install
This Reference Application can be used as a standalone Application, or it can be deployed as a Docker Image.

### Standalone Application
This Reference APP is built over NodeJS. 

#### Deploy the Application
* Install NodeJS LTS: https://nodejs.org/en/download/.
* Clone this repo.
* Configure the API paramerts, in the `src/config.js` file. You will find an example in `src/config_example.js`. To be able to use this application, you will need an account on the [Aerohive Developper Portal](https://developer.aerohive.com/).
* Install npm packages (`npm install` from the project folder).
* Go to `src/bin` folder into the project.
* Start the APP with `www`. You can also use `src/bin/monitor.js` to monitor the NodeJS server and restart it if something went wrong.

#### Manage HTTPS at the application level
If you want to use OAuth authentication, the application will need to use HTTPS. To do so, you can use a reverse Proxy (NGINX, Apache, ...) and manage the certificates at the reverse proxy level, or you can start the application with `www_with_https`. In this case:
* Create a `cert` folder into the `src` project folder.
* Place you certificate and certificate key in this new folder, with the names `server.pem` and `server.key`.
* Start the APP with `www_with_https`. 

### Docker Image
You can easily deploy this application with [Docker](https://www.docker.com/). The image is publicly available on Docker Hub at https://hub.docker.com/r/tmunzer/attendance/.
In this case, you can choose to manually deploy the image and create the container, or you can use the automation script (for Linux).

#### Automation Script
The Automation script will allow you to easily 
* Configure your application (ACS parameters)
* Manage HTTPS certificates with self-signed certificates or with let's encrypt image (the script will automatically download and deploy the let's encrypt container if needed)
* Download and Deploy dependencies, like NGINX container
* Download, Deploy, Update the application container
To use this script, just download it [here](https://github.com/tmunzer/attendance/releases/download/1.0/attendance.sh), and run it in a terminal.

**WARNING:**
Currently, this application requires some customization of the configuration file.
Please check the [config_example.js](https://github.com/tmunzer/Attendance/blob/master/src/config_example.js) file to get more details.

#### Manual deployment
If you are manually deploying this container, you will need to a reverse proxy to manage HTTPS.

`docker create -v <path_to_config.js>/config.js:/app/config.js:ro --link <mongoDB_container_name>:mongo --name="<container_name>" -p 51368:80 tmunzer/attendance`
