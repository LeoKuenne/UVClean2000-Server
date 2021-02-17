const mongoose = require('mongoose');
const AirVolumeModel = require('./models/airVolume');
const AlarmStateModel = require('./models/alarmState');
const LampValueModel = require('./models/lampValue');
const TachoModel = require('./models/tacho');
const UVCDeviceModel = require('../../dataModels/UVCDevice').uvcDeviceModel;

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
    console.log(`Trying to connect to: mongodb://${this.uri}${(this.databaseName !== '') ? `/${this.databaseName}` : ''}`);
    await mongoose.connect(`mongodb://${this.uri}${(this.databaseName !== '') ? `/${this.databaseName}` : ''}`, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: true,
    });

    console.log(`Connected to: mongodb://${this.uri}${(this.databaseName !== '') ? `/${this.databaseName}` : ''}`);

    this.db = mongoose.connection;
    this.db.on('error', console.error.bind(console, 'connection error:'));

    this.db.once('open', () => {
      console.log(`Database ${this.uri}/${this.databaseName} connected.`);
    });
    this.db.once('error', (err) => {
      console.log(`Database ${this.uri}/${this.databaseName}: Error occured: ${err}`);
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
    }).populate('currentAlarm', 'date lamp state')
      .populate('currentAirVolume', 'date volume')
      .populate('tacho', 'date tacho')
      .populate('currentLampValue', 'date lamp value')
      .exec();

    if (device === null || device === undefined) throw new Error('Device does not exists');

    const d = {
      serialnumber: device._id,
      name: device.name,
      engineState: device.engineState,
      engineLevel: device.engineLevel,
      currentAlarm: device.currentAlarm,
      currentLampValue: device.currentLampValue,
      identifyMode: device.identifyMode,
      eventMode: device.eventMode,
      tacho: device.tacho,
      currentAirVolume: device.currentAirVolume,
    };
    return d;
  }

  /**
   * Gets all devices.
   */
  async getDevices() {
    const db = await UVCDeviceModel.find()
      .populate('currentAlarm', 'date lamp state')
      .populate('currentAirVolume', 'date volume')
      .populate('tacho', 'date tacho')
      .populate('currentLampValue', 'date lamp value')
      .exec();

    // eslint-disable-next-line prefer-const
    let devices = [];
    db.map((device) => {
      const d = {
        serialnumber: device._id,
        name: device.name,
        engineState: device.engineState,
        engineLevel: device.engineLevel,
        currentAlarm: device.currentAlarm,
        currentLampValue: device.currentLampValue,
        identifyMode: device.identifyMode,
        eventMode: device.eventMode,
        tacho: (device.tacho) ? device.tacho : 0,
        currentAirVolume: (device.currentAirVolume) ? device.currentAirVolume : 0,
      };
      devices.push(d);
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
      currentAlarm: device.currentAlarm,
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
   * @returns {Array} Returns an array of AirVolumes that match the deviceID
   */
  async getAirVolume(deviceID) {
    return AirVolumeModel.find({ device: deviceID }, '-_id device volume date').exec();
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
        [`currentAlarm.${alarmState.lamp - 1}`]: docAlarmState._id,
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

    UVCDeviceModel.updateOne({
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
   * @returns {Array} Returns an array of LampValues that match the deviceID
   */
  async getLampValues(deviceID, lampID) {
    if (lampID !== undefined) {
      return LampValueModel.find({ device: deviceID, lamp: lampID }, 'device lamp value date').exec();
    }
    return LampValueModel.find({ device: deviceID }, 'device lamp value date').exec();
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
   */
  async getTachos(deviceID) {
    return TachoModel.find({ device: deviceID }, '-_id device tacho date').exec();
  }

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

      default:
        return undefined;
    }
  }
};
