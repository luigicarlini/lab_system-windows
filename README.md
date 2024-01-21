## steps in order to install Nodsjs and MongoDB in windows 11

1. Installing Node.js:
Download Node.js Installer:

Go to the official Node.js download page: Node.js Downloads
Choose the Windows Installer (.msi) either for 32-bit or 64-bit based on your system.

https://nodejs.org/en/download/current

Run the Installer:

Open the downloaded .msi file.
Follow the installation wizard:
Click on the Next button.
Accept the license agreement and click Next.
Leave the default destination folder or choose a different one, then click Next.
Let the installer install the necessary components, including npm (Node.js Package Manager).
Click on the Next button and then Install.
Verify the Installation:

Open Command Prompt or PowerShell and type the following commands to ensure Node.js and npm are installed correctly:

## node -v
## npm -v



2. Installing MongoDB:
Download MongoDB:
Go to the official MongoDB download page: MongoDB Download Center

https://www.mongodb.com/try/download/community


Choose the version you want.
Select the Windows platform and the package you want (usually msi).
Click Download.
Run the Installer:

Open the downloaded .msi file.
Follow the installation wizard:
Click on the Next button.
Accept the license agreement and click Next.
Choose the Complete installation or Custom if you want to customize the install.
Let the installer proceed and install MongoDB.
Set up MongoDB as a Windows Service:

During installation, there should be an option to install MongoDB as a service. This ensures that MongoDB starts automatically every time you start your computer.
Choose Path to Store Data:

By default, MongoDB wants to store data in C:\data\db. If you haven't changed this path during installation, you need to create this directory:

## mkdir C:\data\db


## Start MongoDB:

If you installed MongoDB as a service, it should start automatically after installation and every subsequent restart of your computer.
If not, you can navigate to the MongoDB directory in Command Prompt or PowerShell and start it manually using mongod.
Connect to MongoDB:

In Command Prompt or PowerShell, type mongo to connect to your MongoDB server. This will start the MongoDB shell.
(Optional) Install MongoDB Compass:

MongoDB Compass is the official graphical user interface for MongoDB. During the MongoDB installation, there may be an option to install Compass as well. If you haven't done so, you can download and install it separately from the MongoDB website.
After completing these steps, you should have both Node.js and MongoDB installed and running on your Windows 11 system. Remember to regularly check for updates to both platforms to ensure you have the latest features and security patches.




## Backend (NodeJS + MongoDB): Create a directory named telecom_lab_booking and navigate into it:
mkdir telecom_lab_booking
cd telecom_lab_booking

Inside this directory, create another directory named backend:

mkdir backend
cd backend

Initialize a new NodeJS project:
## npm init -y
Your backend directory might look something like this:

backend/
├── node_modules/
├── controllers/
│   ├── instrumentsController.js
│   └── userController.js
├── models/
│   ├── instrumentModel.js
│   └── userModel.js
├── routes/
│   ├── instrumentRoutes.js
│   └── userRoutes.js
├── utils/
│   └── excelImporter.js
├── app.js
└── package.json

node_modules/: All your installed npm packages will reside here.
controllers/: Houses the logic for handling client requests.
models/: Describes the data model and schema for MongoDB.
routes/: Defines the API endpoints and associates them with the correct controller functions.
utils/: Utility files, like the script for importing Excel data into MongoDB.
app.js: Main file to run your NodeJS server.


## Frontend (React)
Navigate back to the telecom_lab_booking directory and create a React app:

npx create-react-app frontend
Your frontend directory might look something like this:

java
Copy code
frontend/
├── node_modules/
├── public/
├── src/
│   ├── components/
│   │   ├── InstrumentList.js
│   │   ├── InstrumentItem.js
│   │   ├── BookingForm.js
│   │   └── ...
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Login.js
│   │   └── Dashboard.js
│   ├── App.js
│   └── index.js
├── package.json
└── ...

node_modules/: Installed npm packages for the frontend.
public/: Static files.
src/components/: React components for various UI parts.
src/pages/: Components representing entire pages in the React app.
App.js: Main file to bootstrap your React components.
Additional Files and Folders
README.md: Documentation on how to run and use your system.
.gitignore: List of files and folders to ignore if you're using Git.
.env: Environment variables like your MongoDB connection string.


So, the complete project structure might look like:

telecom_lab_booking/
├── backend/
│   ├── ... (as described above)
└── frontend/
    ├── ... (as described above)
This project structure is just a suggestion and could vary depending on the needs and complexity of your project.



### How to Add Packages

After running npm init -y, you would typically start adding packages (libraries) that your project needs. For example, to add Express, you would run:

## npm install express

## npm init -y 

npm init -y  is just the first step to set up your Node.js project. Installing specific packages comes next, and that's when the node_modules/ directory gets populated.
Navigate to Project Directory: Open a terminal and navigate to the directory where your package.json file is located. This is usually the root directory of your Node.js project.
Run 

## npm install: 

Run the npm install command followed by the package name you want to install. For example, if you want to install the package express, you'd type:

npm install express

This command will download the Express package and its dependencies and place them in a folder called node_modules/ within your project directory.



## Solution 1: Downgrade Node.js

The quickest solution would be to downgrade your Node.js version. Node.js v14 (LTS) or v16 (LTS) are recommended since they're more stable and compatible with a broader range of packages. You can use 

## Node Version Manager (NVM) 

to easily switch between Node.js versions.
Here's how you can do it:

    Install NVM:
        On Windows: Use nvm-windows.
        On macOS/Linux: Use nvm.

    Install Node.js v16 (LTS) using NVM:

# nvm install 16

Switch to Node.js v16:
nvm use 16
After switching to Node.js v16, try running your project again:

## npm start

