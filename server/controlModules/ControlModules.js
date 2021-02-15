const AddDeviceModul = require('./Command/AddDeviceModul');
const DeleteDeviceModul = require('./Command/DeleteDeviceModul');
const DeviceAddedModul = require('./Event/DeviceAddedModul');

module.exports = {
  modules: [
    AddDeviceModul,
    DeviceAddedModul,
    DeleteDeviceModul,
  ],
};
