const AddDeviceModul = require('./Command/AddDeviceModul');
const DeleteDeviceModul = require('./Command/DeleteDeviceModul');
const DeviceAddedModul = require('./Event/DeviceAddedModul');
const DeviceDeletedModul = require('./Event/DeviceDeletedModul');

module.exports = {
  modules: [
    AddDeviceModul,
    DeviceAddedModul,
    DeleteDeviceModul,
    DeviceDeletedModul,
  ],
};
