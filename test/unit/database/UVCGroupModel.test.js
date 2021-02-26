const mongoose = require('mongoose');
const UVCGroupModel = require('../../../server/dataModels/UVCGroup').uvcGroupModel;

const group = {
  name: 'Group 1',
};

describe('UVCGroup Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(`${global.__MONGO_URI__}`,
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      }, (err) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
      });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('create & save group successfully', async () => {
    const validGroup = new UVCGroupModel(group);
    const savedGroup = await validGroup.save();

    expect(savedGroup._id).toBeDefined();
    expect(savedGroup.name).toBe(group.name);
  });

  it('insert group successfully, but the field not defined in schema should be undefined', async () => {
    group.undefinedField = '';
    const groupWithInvalidField = new UVCGroupModel(group);
    const savedGroupWithInvalidField = await groupWithInvalidField.save();
    expect(savedGroupWithInvalidField._id).toBeDefined();
    expect(savedGroupWithInvalidField.undefinedField).toBeUndefined();
  });

  it('create group without required field should failed', async () => {
    const groupWithoutRequiredField = new UVCGroupModel({ _id: '3' });
    let err;
    try {
      const savedGroupWithoutRequiredField = await groupWithoutRequiredField.save();
      error = savedGroupWithoutRequiredField;
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors._id).toBeDefined();
  });
});
