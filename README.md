# UVClean2000-Server

This is the Server for the UVClean2000 device.

A detailed documentation can be found here: https://www.notion.so/UVClean-2000-Access-Point-Steuerung-9fdd9ea3134b4aa4b1dd14069ab2a7fd

A UVCClean Device is called a client. A UVCClean Access Point is called a server.

A Client has properties and functions:
- Properties:
  - On/Off State
  - Error State
  - Rotation Speed
  - Lamp State
  - IP-Address
  - Device Name
- Functions:
  - Engine On/Off
  - Engine Levels
  - Event Mode
  - Identify Mode
  - IP-Address
  - Device Name

## Project setup
```
npm install
```

## Frontend
The Frontend website sits in "dist".

### Frontend technologies:
- Vue.js as Frontend Framework
- Tailwind as CSS-Framework
- Socket.io for communication to Server

### Data communication
- Add Device
  - POST to Server with new Device
  - POST respond with new Device List
- Edit Device
  - POST to Server with new Device
  - POST respond with new Device List
- Set propertie

### Start Frontend development
```
npm run serve
```

### Build for production
```
npm run build
```

## Backend
The Backend-Server sits in "server".

Backend technologies:
- Socket.io for communication to Frontend
- 

### hot-reloads for development
```
nodemon index.js
```
