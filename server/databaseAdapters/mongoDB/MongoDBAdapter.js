const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const AirVolumeModel = require('./models/airVolume');
const AlarmStateModel = require('./models/alarmState');
const LampValueModel = require('./models/lampValue');
const TachoModel = require('./models/tacho');
const FanStateModel = require('./models/fanState');
const UVCDeviceModel = require('../../dataModels/UVCDevice').uvcDeviceModel;
const UVCGroupModel = require('./models/group').uvcGroupModel;
const MainLogger = require('../../Logger.js').logger;

const logger = MainLogger.child({ service: 'MongoDBAdapter' });

module.exports = class MongoDBAdapter {
  /**
   * Creates an MongoDB adabter.
   * @param {String} uri The URI of the MongoDB Server
   * @param {String} databaseName The Database Name on the MongoDB Server
   * the Adapter should connect to
   */
  constructor(uri, databaseName) {
    if (uri === undefined || databaseName === undefined) throw new Error('uri and databaseName must be defined');
    this.uri = uri;
    this.databaseName = databaseName;
    mongoose.set('useFindAndModify', false);
  }

  async connect() {
    logger.info(`Trying to connect to: mongodb://${this.uri}${(this.databaseName !== '') ? `/${this.databaseName}` : ''}`);
    await mongoose.connect(`mongodb://${this.uri}${(this.databaseName !== '') ? `/${this.databaseName}` : ''}`, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: true,
    });

    logger.info(`Connected to: mongodb://${this.uri}${(this.databaseName !== '') ? `/${this.databaseName}` : ''}`);

    this.db = mongoose.connection;
    this.db.on('error', console.error.bind(console, 'connection error:'));

    this.db.once('open', () => {
      logger.info(`Database ${this.uri}/${this.databaseName} connected.`);
    });
    this.db.once('error', (err) => {
      logger.info(`Database ${this.uri}/${this.databaseName}: Error occured: ${err}`);
    });
  }

  /**
   * Closes the database connection gracefully.
   */
  async close() {
    if (this.db !== undefined) { await this.db.close(); }
  }

  /**
   * Clears the collection completely.
   * @param {String} collection Collectionname
   */
  async clearCollection(collection) {
    if (this.db !== undefined) { await this.db.collection(collection).deleteMany({}); }
  }

  /* eslint-disable class-methods-use-this */
  /* eslint-disable no-underscore-dangle */

  /**
   * Adds a Device to the MongoDB 'devices' database. Throws an error if the validation fails.
   * @param {Object} device Deviceobject that must have the properties _id and name
   * @returns {mongoose.Document<any>} The saved mongoose document
   */
  async addDevice(deviceData) {
    if (deviceData.serialnumber === undefined) throw new Error('Serialnumber must be defined.');

    const device = {
      _id: deviceData.serialnumber,
    };

    Object.keys(deviceData).forEach((key) => {
      device[key] = deviceData[key];
    });

    const docDevice = new UVCDeviceModel(device);
    const err = docDevice.validateSync();
    if (err !== undefined) throw err;
    return docDevice.save();
  }

  /**
   * Gets an device with the given deviceID.
   * @param {String} deviceID The device ID respectively serialnumber of that device
   * @returns {Object} The device object
   */
  async getDevice(deviceID) {
    if (typeof deviceID !== 'string') { throw new Error('DeviceID has to be a string'); }

    const device = await UVCDeviceModel.findOne({
      _id: deviceID,
    }).populate('currentLampState', 'date lamp state')
      .populate('currentAirVolume', 'date volume')
      .populate('tacho', 'date tacho')
      .populate('currentFanState', 'date state')
      .populate('currentLampValue', 'date lamp value')
      .exec();

    if (device === null || device === undefined) throw new Error('Device does not exists');

    const d = {
      serialnumber: device._id,
      name: device.name,
      group: `${device.group}`,
      engineState: device.engineState,
      engineLevel: device.engineLevel,
      currentBodyAlarm: device.currentBodyAlarm,
      currentFanState: (device.currentFanState) ? device.currentFanState : { state: '' },
      currentLampState: device.currentLampState,
      currentLampValue: device.currentLampValue,
      identifyMode: device.identifyMode,
      eventMode: device.eventMode,
      tacho: (device.tacho) ? device.tacho : { tacho: 0 },
      currentAirVolume: (device.currentAirVolume) ? device.currentAirVolume : { volume: 0 },
    };
    return d;
  }

  /**
   * Gets all devices.
   */
  async getDevices() {
    const db = await UVCDeviceModel.find()
      .populate('currentLampState', 'date lamp state')
      .populate('currentAirVolume', 'date volume')
      .populate('tacho', 'date tacho')
      .populate('currentFanAlarm', 'date state')
      .populate('currentLampValue', 'date lamp value')
      .exec();

    // eslint-disable-next-line prefer-const
    let devices = [];
    db.map((device) => {
      const d = {
        serialnumber: device._id,
        name: device.name,
        group: `${device.group}`,
        engineState: device.engineState,
        engineLevel: device.engineLevel,
        currentBodyAlarm: device.currentBodyAlarm,
        currentFanState: (device.currentFanState) ? device.currentFanState : { state: '' },
        currentLampState: device.currentLampState,
        currentLampValue: device.currentLampValue,
        identifyMode: device.identifyMode,
        eventMode: device.eventMode,
        tacho: (device.tacho) ? device.tacho : { tacho: 0 },
        currentAirVolume: (device.currentAirVolume) ? device.currentAirVolume : { volume: 0 },
      };
      devices.push(d);
      return device;
    });

    return devices;
  }

  /**
   * Gets all devices.
   */
  async getSerialnumbers() {
    const db = await UVCDeviceModel.find().select('_id').exec();

    // eslint-disable-next-line prefer-const
    let devices = [];
    db.map((device) => {
      devices.push(device._id);
      return device;
    });

    return devices;
  }

  /**
   * Updates the given device. Throws an error if the validation fails and if
   * the document not exists
   * @param {Object} device Deviceobject with the device ID respectively
   * serialnumber and the propertie to change with the new value
   * @returns Returns updated device
   */
  async updateDevice(deviceData) {
    if (deviceData.serialnumber === undefined) throw new Error('Serialnumber must be defined.');

    const device = {
      _id: deviceData.serialnumber,
    };

    Object.keys(deviceData).forEach((key) => {
      device[key] = deviceData[key];
    });

    const d = await UVCDeviceModel.findOneAndUpdate(
      { _id: device._id },
      device,
      { new: true },
    ).exec();
    if (d === null) throw new Error('Device does not exists');
    return d;
  }

  /**
   * Deletes the given device that has the deviceID. Throws an error if the document not exists
   * @param {Object} deviceID The device ID respectively serialnumber of that device
   * @returns Deleted device
   */
  async deleteDevice(deviceID) {
    if (typeof deviceID !== 'string') { throw new Error('DeviceID has to be a string'); }

    const device = await UVCDeviceModel.findOneAndRemove({ _id: deviceID }).exec();
    if (device === null) throw new Error('Device does not exists');
    const d = {
      serialnumber: device._id,
      name: device.name,
      engineState: device.engineState,
      engineLevel: device.engineLevel,
      currentBodyAlarm: device.currentBodyAlarm,
      currentFanState: device.currentFanState,
      currentLampState: device.currentLampState,
      currentLampValue: device.currentLampValue,
      identifyMode: device.identifyMode,
      eventMode: device.eventMode,
      tacho: device.tacho,
      currentAirVolume: device.currentAirVolume,
    };
    return d;
  }

  /**
   * Adds an air volume document to the database and links the devices' currentAirVolume
   * field to that document
   * @param {Object} airVolume The Object with the device id respectively serialnumber of that
   * device and the current volume
   * @returns Returns the airVolume document
   */
  async addAirVolume(airVolume) {
    const docAirVolume = new AirVolumeModel(airVolume);
    const err = docAirVolume.validateSync();
    if (err !== undefined) throw err;

    await docAirVolume.save().catch((e) => {
      if (e) { console.error(e); }
    });

    UVCDeviceModel.updateOne({
      _id: airVolume.device,
    }, {
      $set: {
        currentAirVolume: docAirVolume._id,
      },
    }, (e) => {
      if (e !== null) { console.error(e); throw e; }
    });

    return docAirVolume;
  }

  /**
   * Gets all AirVolume documents that match the deviceID
   * @param {String} deviceID The device ID respectively serialnumber of that device
   * @param {Date} fromDate The Date after the documents should be selected
   * @param {Date} toDate The Date before the documents should be selected
   * @returns {Array} Returns an array of AirVolumes that match the deviceID
   */
  async getAirVolume(deviceID, fromDate, toDate) {
    const query = AirVolumeModel.find({ device: deviceID }, '-_id device volume date');
    if (fromDate !== undefined && fromDate instanceof Date) {
      query.gte('date', fromDate);
    }
    if (toDate !== undefined && toDate instanceof Date) {
      query.lte('date', toDate);
    }
    return query.exec();
  }

  /**
   * Adds an alarmState document which holds a current alarm, the device, the lamp and date
   * @param {Object} alarmState The Object with the device id respectively serialnumber of that
   * device and the current alarm and lamp
   * @returns Returns the alarmState document
   */
  async setAlarmState(alarmState) {
    const docAlarmState = new AlarmStateModel(alarmState);
    const err = docAlarmState.validateSync();
    if (err !== undefined) throw err;

    await docAlarmState.save();

    UVCDeviceModel.updateOne({
      _id: alarmState.device,
    }, {
      $set: {
        [`currentLampState.${alarmState.lamp - 1}`]: docAlarmState._id,
      },
    }, (e) => {
      if (e !== null) { console.error(e); throw e; }
    });

    // if (device === null) throw new Error('Device does not exists');

    return docAlarmState;
  }

  /**
   * Gets all AlarmState documents that match the deviceID
   * @param {String} deviceID The device ID respectively serialnumber of that device
   * @returns {Array} Returns an array of AlarmState that match the deviceID
   */
  async getAlarmState(deviceID) {
    return AlarmStateModel.find({ device: deviceID }, 'device lamp state date').exec();
  }

  /**
   * Adds an lampValue document which holds the current value, the device, the lamp and date
   * @param {Object} lampValue The Object with the device id respectively serialnumber of that
   * device and the current value and lamp
   * @returns Returns the lampValue document
   */
  async addLampValue(lampValue) {
    const docLampValue = new LampValueModel(lampValue);
    const err = docLampValue.validateSync();
    if (err !== undefined) throw err;

    await docLampValue.save();

    await UVCDeviceModel.updateOne({
      _id: lampValue.device,
    }, {
      $set: {
        [`currentLampValue.${lampValue.lamp - 1}`]: docLampValue._id,
      },
    }, (e) => {
      if (e !== null) { console.error(e); throw e; }
    });

    // if (device === null) throw new Error('Device does not exists');

    return docLampValue;
  }

  /**
   * Gets all LampValues documents that match the deviceID
   * @param {String} deviceID The device ID respectively serialnumber of that device
   * @param {Number} [lampID] The Lamp of which values should be get
   * @param {Date} [fromDate] The Date after the documents should be selected
   * @param {Date} [toDate] The Date before the documents should be selected
   * @returns {Array} Returns an array of LampValues that match the deviceID
   */
  async getLampValues(deviceID, lampID, fromDate, toDate) {
    const query = LampValueModel.find({ device: deviceID }, 'device lamp value date');
    if (lampID !== undefined && typeof lampID === 'string') {
      query.where('lamp', lampID);
    }
    if (fromDate !== undefined && fromDate instanceof Date) {
      query.gte('date', fromDate);
    }
    if (toDate !== undefined && toDate instanceof Date) {
      query.lte('date', toDate);
    }
    query.sort({ lamp: 'asc', date: 'asc' });
    return query.exec();
  }

  /**
   * Adds a Rotation Speed document to the database.
   * @param {Object} tacho The Tacho object with the device id
   * respectively serialnumber of that
   * device and the tacho
   * @returns {Document<any>} Returns the Tacho Document
   */
  async addTacho(tacho) {
    const docTacho = new TachoModel(tacho);
    const err = docTacho.validateSync();
    if (err !== undefined) throw err;

    await docTacho.save().catch((e) => {
      if (e) { console.error(e); }
    });

    UVCDeviceModel.updateOne({
      _id: tacho.device,
    }, {
      $set: {
        tacho: docTacho._id,
      },
    }, (e) => {
      if (e !== null) { console.error(e); throw e; }
    });

    return docTacho;
  }

  /**
   * Gets all Tacho documents of that device
   * @param {String} deviceID The device ID respectively serialnumber of that device
   * @param {Date} [fromDate] The Date after the documents should be selected
   * @param {Date} [toDate] The Date before the documents should be selected
   */
  async getTachos(deviceID, fromDate, toDate) {
    const query = TachoModel.find({ device: deviceID }, '-_id device tacho date');
    if (fromDate !== undefined && fromDate instanceof Date) {
      query.gte('date', fromDate);
    }
    if (toDate !== undefined && toDate instanceof Date) {
      query.lte('date', toDate);
    }
    query.sort({ lamp: 'asc', date: 'asc' });
    return query.exec();
  }

  /**
   * Adds a fan Alarm document to the database.
   * @param {Object} fanState The FanState object with the device id
   * respectively serialnumber of that device and the fanState
   * @param {string} fanAlarm.device the device id respectively serialnumber of that device
   * @param {string} fanAlarm.state the alarm state
   * @returns {Document<any>} Returns the FanState Document
   */
  async addFanState(fanState) {
    const docFanState = new FanStateModel(fanState);
    const err = docFanState.validateSync();
    if (err !== undefined) throw err;

    await docFanState.save().catch((e) => {
      if (e) { console.error(e); }
    });

    UVCDeviceModel.updateOne({
      _id: fanState.device,
    }, {
      $set: {
        currentFanState: docFanState._id,
      },
    }, (e) => {
      if (e !== null) { console.error(e); throw e; }
    });

    return docFanState;
  }

  /**
   * Gets all FanState documents of that device
   * @param {String} deviceID The device ID respectively serialnumber of that device
   * @param {Date} [fromDate] The Date after the documents should be selected
   * @param {Date} [toDate] The Date before the documents should be selected
   */
  async getFanStates(deviceID, fromDate, toDate) {
    const query = FanStateModel.find({ device: deviceID }, '-_id device state date');
    if (fromDate !== undefined && fromDate instanceof Date) {
      query.gte('date', fromDate);
    }
    if (toDate !== undefined && toDate instanceof Date) {
      query.lte('date', toDate);
    }
    query.sort({ lamp: 'asc', date: 'asc' });
    return query.exec();
  }

  /**
   * Gets the first and last date where a document of the provided propertie can be found
   * @param {string} deviceID The device ID respectively serialnumber of that device
   * @param {string} propertie The propertie to get the duration of
   */
  async getDurationOfAvailableData(deviceID, propertie) {
    let dataLatest = '';
    let dataOldest = '';

    switch (propertie) {
      case 'currentAirVolume':
        dataLatest = await AirVolumeModel.find({ device: deviceID }).sort({ date: -1 }).limit(1);
        dataOldest = await AirVolumeModel.find({ device: deviceID }).sort({ date: 1 }).limit(1);
        if (dataLatest.length === 1 && dataOldest.length === 1) {
          return {
            from: dataOldest[0].date,
            to: dataLatest[0].date,
          };
        }
        return undefined;
      case 'lampValues':
        dataLatest = await LampValueModel.find({ device: deviceID }).sort({ date: -1 }).limit(1);
        dataOldest = await LampValueModel.find({ device: deviceID }).sort({ date: 1 }).limit(1);
        if (dataLatest.length === 1 && dataOldest.length === 1) {
          return {
            from: dataOldest[0].date,
            to: dataLatest[0].date,
          };
        }
        return undefined;
      case 'tacho':
        dataLatest = await TachoModel.find({ device: deviceID }).sort({ date: -1 }).limit(1);
        dataOldest = await TachoModel.find({ device: deviceID }).sort({ date: 1 }).limit(1);
        if (dataLatest.length === 1 && dataOldest.length === 1) {
          return {
            from: dataOldest[0].date,
            to: dataLatest[0].date,
          };
        }
        return undefined;

      default:
        return undefined;
    }
  }

  /**
   * Adds an group with the provided name and returns the document
   * @param {Object} group An object that represents the group
   * @param {string} group.name The name of the group to be created
   */
  async addGroup(group) {
    if (group.name === undefined) throw new Error('Name must be defined.');

    const docGroup = new UVCGroupModel(group);
    const err = docGroup.validateSync();
    if (err !== undefined) throw err;
    return docGroup.save();
  }

  /**
   * Gets the group by the given _id
   * @param {string} groupID The group _id
   */
  async getGroup(groupID) {
    if (typeof groupID !== 'string') {
      throw new Error('GroupID has to be a string');
    }

    const groupData = await UVCGroupModel.findOne({ _id: groupID }).exec();

    if (groupData === null) {
      throw new Error('Group does not exists');
    }

    const group = {
      id: groupData._id,
      name: groupData.name,
      devices: groupData.devices,
    };

    return group;
  }

  /**
   * Gets all groups
   */
  async getGroups() {
    const groupData = await UVCGroupModel.find().exec();

    const groups = [];
    groupData.map((group) => {
      const d = {
        id: group._id,
        name: group.name,
        devices: group.devices,
      };
      groups.push(d);
      return group;
    });

    return groups;
  }

  /**
   *
   * @param {Object} group The object representing the group
   * @param {string} group._id The object representing the group
   * @param {string} [group.name] The new name of the group
   */
  async updateGroup(group) {
    if (group._id === undefined || typeof group._id !== 'string') throw new Error('_id must be defined.');

    const docGroup = await UVCGroupModel.findOneAndUpdate(
      { _id: new ObjectId(group._id) },
      group,
      { new: true },
    ).exec();

    if (docGroup === null) {
      throw new Error('Group does not exists');
    }

    return docGroup;
  }

  /**
   *
   * @param {Object} group The object representing the group
   * @param {string} group.id The object representing the group
   */
  async deleteGroup(group) {
    if (group.id === undefined || typeof group.id !== 'string') throw new Error('id must be defined and typeof string.');

    const docGroup = await UVCGroupModel.findOneAndDelete(
      { _id: new ObjectId(group.id) },
    ).exec();

    if (docGroup === null) {
      throw new Error('Group does not exists');
    }

    return docGroup;
  }

  /**
   * Adds the given serialnumber of the device to the group if it is not already in that group.
   * Before that it checks, wether the device exists.
   * @param {string} deviceSerialnumber The Serialnumber of the device that should be added
   * @param {string} groupID The group ID of the group the device should be added to
   */
  async addDeviceToGroup(deviceSerialnumber, groupID) {
    if (typeof deviceSerialnumber !== 'string') { throw new Error('deviceSerialnumber must be defined and typeof string'); }
    if (typeof groupID !== 'string') { throw new Error('groupID must be defined and typeof string'); }

    const docDevice = await UVCDeviceModel.updateOne(
      {
        _id: deviceSerialnumber,
      },
      { group: new ObjectId(groupID) },
      (e) => {
        if (e !== null) { console.error(e); throw e; }
      },
    ).exec();

    const docGroup = await UVCGroupModel.updateOne({
      _id: new ObjectId(groupID),
    }, {
      $addToSet: {
        devices: deviceSerialnumber,
      },
    }, (e) => {
      if (e !== null) { console.error(e); throw e; }
    }).exec().catch((e) => {
      console.error(e);
      throw e;
    });

    return docGroup;
  }

  /**
   * Delete the device with the given serialnumber from the group.
   * Before that it checks, wether the device exists.
   * @param {string} deviceSerialnumber The Serialnumber of the device that should be deleted
   * @param {string} groupID The group ID of the group the device should be deleted from
   *
   */
  async deleteDeviceFromGroup(deviceSerialnumber, groupID) {
    if (typeof deviceSerialnumber !== 'string') { throw new Error('deviceSerialnumber must be defined and typeof string'); }
    if (typeof groupID !== 'string') { throw new Error('groupID must be defined and typeof string'); }

    await this.getDevice(deviceSerialnumber);

    const docGroup = await UVCGroupModel.updateOne({
      _id: new ObjectId(groupID),
    }, {
      $pull: {
        devices: deviceSerialnumber,
      },
    }, (e) => {
      if (e !== null) { console.error(e); throw e; }
    }).exec();

    return docGroup;
  }
};
