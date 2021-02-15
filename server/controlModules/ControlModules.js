const AddDeviceModul = require('./Command/AddDeviceModul');
const DeleteDeviceModul = require('./Command/DeleteDeviceModul');
const DeviceAddedModul = require('./Event/DeviceAddedModul');
const DeviceDeletedModul = require('./Event/DeviceDeletedModul');
const DeviceStateChangedModul = require('./Event/DeviceStateChangedModul');
const DeviceChangeStateModul = require('./Command/DeviceChangeStateModul');

module.exports = {
  modules: [
    AddDeviceModul,
    DeviceAddedModul,
    DeleteDeviceModul,
    DeviceDeletedModul,
    DeviceStateChangedModul,
    DeviceChangeStateModul,
  ],
};
