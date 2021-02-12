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

## MongoDB Startup
"C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe" --serviceName MongoDB-UVCleanServer --serviceDisplayName MongoDB-UVCleanServer --serviceUser Leo --dbpath dbData/

## MQTT Helper
mqtt sub -h 192.168.5.60 -t UVClean/# -v
mqtt publish -h 192.168.5.60 -t UVClean/0002145702154/change_state/engineState -m false

Event: MQTT-Message: UVClean/0002145702154/state_changed/lamp/1 | 4.06
Event: MQTT-Message: UVClean/0002145702154/state_changed/lamp/2 | 8.21
Event: MQTT-Message: UVClean/0002145702154/state_changed/lamp/3 | 7.58
Event: MQTT-Message: UVClean/0002145702154/state_changed/lamp/4 | 8.19
Event: MQTT-Message: UVClean/0002145702154/state_changed/lamp/5 | 7.57
Event: MQTT-Message: UVClean/0002145702154/state_changed/lamp/6 | 4.06
Event: MQTT-Message: UVClean/0002145702154/state_changed/lamp/7 | 8.19
Event: MQTT-Message: UVClean/0002145702154/state_changed/lamp/8 | 7.57
Event: MQTT-Message: UVClean/0002145702154/state_changed/lamp/9 | 4.06
Event: MQTT-Message: UVClean/0002145702154/state_changed/lamp/10 | 8.19
Event: MQTT-Message: UVClean/0002145702154/state_changed/lamp/11 | 7.57
Event: MQTT-Message: UVClean/0002145702154/state_changed/lamp/12 | 4.06
Event: MQTT-Message: UVClean/0002145702154/state_changed/lamp/13 | 8.19
Event: MQTT-Message: UVClean/0002145702154/state_changed/lamp/14 | 7.55
Event: MQTT-Message: UVClean/0002145702154/state_changed/lamp/15 | 7.58
Event: MQTT-Message: UVClean/0002145702154/state_changed/lamp/16 | 3.04
Event: MQTT-Message: UVClean/0002145702154/state_changed/Tacho | 4.88

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
