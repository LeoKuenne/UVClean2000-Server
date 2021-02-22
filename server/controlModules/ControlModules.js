const AddDeviceModul = require('./Command/AddDeviceModule');
const DeleteDeviceModule = require('./Command/DeleteDeviceModule');
const DeviceAddedModule = require('./Event/DeviceAddedModule');
const DeviceDeletedModule = require('./Event/DeviceDeletedModule');
const DeviceStateChangedModule = require('./Event/DeviceStateChangedModule');
const DeviceChangeStateModule = require('./Command/DeviceChangeStateModule');
const AddGroupModule = require('./Command/AddGroupModule');
const GroupAddedModule = require('./Event/GroupAddedModule');
const GroupAddDeviceModule = require('./Command/GroupAddDeviceModule');
const GroupDeleteDeviceModule = require('./Command/GroupDeleteDeviceModule');
const GroupDeviceAddedModule = require('./Event/GroupDeviceAddedModule');
const GroupDeviceDeletedModule = require('./Event/GroupDeviceDeletedModule');
const GroupChangeStateModule = require('./Command/GroupChangeStateModule');
const GroupStateChangedModule = require('./Event/GroupStateChangedModule');
const DeleteGroupModule = require('./Command/DeleteGroupModule');
const GroupDeletedModule = require('./Event/GroupDeletedModule');

module.exports = {
  modules: [
    AddDeviceModul,
    DeleteDeviceModule,
    DeviceAddedModule,
    DeviceDeletedModule,
    DeviceStateChangedModule,
    DeviceChangeStateModule,
    AddGroupModule,
    GroupAddedModule,
    GroupAddDeviceModule,
    GroupDeleteDeviceModule,
    GroupDeviceAddedModule,
    GroupDeviceDeletedModule,
    GroupChangeStateModule,
    GroupStateChangedModule,
    DeleteGroupModule,
    GroupDeletedModule,
  ],
};
