const mongoose = require('mongoose');
const AirVolume = require('./models/airVolume');
const UVCDeviceModel = require('./models/device');

module.exports = class MongoDBAdapter {
  constructor(uri, databaseName) {
    this.uri = uri;
    this.databaseName = databaseName;
  }

  async connect() {
    console.log(`Trying to connect to: ${this.uri}${(this.databaseName !== '') ? `/${this.databaseName}` : ''}`);
    const connect = await mongoose.connect(`${this.uri}${(this.databaseName !== '') ? `/${this.databaseName}` : ''}`, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    }, (err) => {
      if (err) { throw new Error(err); }
    });

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
   */
  async addDevice(deviceData) {
    const docDevice = new UVCDeviceModel(deviceData);
    const err = docDevice.validateSync();
    if (err !== undefined) throw err;
    return docDevice.save();
  }

  /**
   * Gets an device with the given deviceID.
   * @param {String} deviceID The device ID respectively serialnumber of that device
   */
  async getDevice(deviceID) {
    if (typeof deviceID !== 'string') { throw new Error('DeviceID has to be a string'); }

    const d = await UVCDeviceModel.findById(deviceID).exec();
    if (d === null) throw new Error('Device does not exists');
    return d;
  }

  /**
   * Updates the given device. Throws an error if the validation fails and if
   * the document not exists
   * @param {Object} device Deviceobject with the device ID respectively
   * serialnumber and the propertie to change with the new value
   * @returns Returns updated device
   */
  async updateDevice(device) {
    if (device._id === undefined) throw new Error('Device ID must be defined');

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
   * @returns Deleted updated device
   */
  async deleteDevice(deviceID) {
    if (deviceID === undefined) throw new Error('Device ID must be defined');

    const d = await UVCDeviceModel.findOneAndRemove({ _id: deviceID }).exec();
    if (d === null) throw new Error('Device does not exists');
    return d;
  }

  /**
   * Adds an air volume document to the database and links the devices' currentAirVolume
   * field to that document
   * @param {Object} airVolume The Object with the device id respectively serialnumber of that
   * device and the current volume
   * @returns Returns the airVolume Object
   */
  async addAirVolume(airVolume) {
    const docAirVolume = new AirVolume(airVolume);
    const err = docAirVolume.validateSync();
    if (err !== undefined) throw err;

    await docAirVolume.save();

    await this.updateDevice({
      _id: airVolume.device,
      currentAirVolume: docAirVolume._id,
    });
    return docAirVolume;
  }
};
