const mongoose = require('mongoose');

module.exports = class MongoDBAdapter {
  constructor(uri, databaseName) {
    this.uri = uri;
    this.databaseName = databaseName;

    mongoose.connect(this.uri + this.databaseName, { useNewUrlParser: true, useUnifiedTopology: true });
    this.db = mongoose.connection;
    this.db.on('error', console.error.bind(console, 'connection error:'));

    this.uvcDeviceSchema = new mongoose.Schema({
      _id: { type: String, required: true },
      name: { type: String, default: 'UVCClean Gerät' },
      state: { type: Boolean, default: true },
      engineLevel: { type: Number, default: 0 },
      lastError: { type: String },
      identifyMode: { type: Boolean, default: false },
      eventMode: { type: Boolean, default: false },
      rotationSpeed: { type: Number, default: 0 },
      airVolume: { type: Number, default: 0 },
    });

    this.UVCDevice = mongoose.model('UVCDevice', this.uvcDeviceSchema);
    this.db.once('open', function () {
      console.log(`Database ${this.uri}/${this.databaseName} connected.`);
    });
  }

  async updateDevice(device) {
    console.log('Updating Device with: ', device);
    this.UVCDevice.updateOne({ _id: device.serialnumber }, device, (err) => {
      if (err) return console.error(err);
    });
  }

  async storeDevice(device) {
    const d = new this.UVCDevice({
      _id: device.serialnumber,
      name: device.name,
      state: device.state,
      engineLevel: device.engineLevel,
      lastError: device.lastError,
      identifyMode: device.identifyMode,
      eventMode: device.eventMode,
      rotationSpeed: device.rotationSpeed,
      airVolume: device.airVolume,
    });
    return d.save((err) => {
      if (err) return console.error(err);
    });
  }

  async getDevices() {
    return this.UVCDevice.find((err) => {
      if (err) return console.error(err);
    });
  }

  async getDatabase() {
    return this.UVCDevice.find((err) => {
      if (err) return console.error(err);
    });
  }
};
