# RamiKart
Project Setup Guide
Prerequisites: Setting Up Linux Environment
Before running this project, you need to establish a Linux environment on your system. If you're using Windows, you'll need to install Windows Subsystem for Linux (WSL), which creates a Linux-compatible layer that allows you to run Linux commands directly from your Windows machine.
To verify that your Linux shell is properly configured, open your Visual Studio Code terminal and run this command: wsl. This command should successfully launch your Linux subsystem without errors. If you encounter issues here, you'll need to install or troubleshoot your WSL installation before proceeding.


Database Setup
Once your Linux environment is confirmed working, you can initialize the database using Docker containers. Docker Compose orchestrates multiple containers that work together, which is perfect for database setups that often require specific configurations and dependencies.
Start the database service by running: docker-compose up -d
The -d flag runs the containers in "detached" mode, meaning they'll run in the background without occupying your terminal window. This allows you to continue using the same terminal for other commands.
To confirm that your database container is running properly, check the active containers: docker ps
This command displays all currently running Docker containers. You should see your database container listed with a status of "Up" along with timing information showing how long it has been running.
Server Initialization
With the database now operational, you can start the backend server. The server acts as the bridge between your database and frontend, handling data requests and business logic.
Navigate to the backend directory and start the server: 1. cd Backend 2. node server.js

At this point, both your database and server should be running simultaneously. The server will typically display startup messages confirming successful database connections and which port it's listening on.
Accessing the Frontend
The final step involves accessing the user interface through your web browser. The frontend has been deployed and is accessible at:
https://kzml8lrbsi6dtfc5fot5.lite.vusercontent.net/
Simply open this URL in your browser to interact with your fully operational application. The frontend will communicate with your locally running backend server to display and manage your data.
