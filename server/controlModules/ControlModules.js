const AddDeviceModul = require('./Command/AddDeviceModule');
const DeleteDeviceModule = require('./Command/DeleteDeviceModule');
const DeviceAddedModule = require('./Event/DeviceAddedModule');
const DeviceDeletedModule = require('./Event/DeviceDeletedModule');
const DeviceStateChangedModule = require('./Event/DeviceStateChangedModule');
const DeviceChangeStateModule = require('./Command/DeviceChangeStateModule');
const AddGroupModule = require('./Command/AddGroupModule');
const GroupAddedModule = require('./Event/GroupAddedModule');
const GroupChangeStateModule = require('./Command/GroupChangeStateModule');
const GroupStateChangedModule = require('./Event/GroupStateChangedModule');
const DeleteGroupModule = require('./Command/DeleteGroupModule');
const GroupDeletedModule = require('./Event/GroupDeletedModule');

module.exports = {
  modules: [
    AddDeviceModul,
    DeleteDeviceModule,
    AddGroupModule,
    DeleteGroupModule,
    DeviceChangeStateModule,
    GroupChangeStateModule,
    DeviceAddedModule,
    DeviceDeletedModule,
    DeviceStateChangedModule,
    GroupAddedModule,
    GroupStateChangedModule,
    GroupDeletedModule,
  ],
};
