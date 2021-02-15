const UVCDevice = require('../../server/dataModels/UVCDevice');

describe('parseStates function', () => {
  it('Parses engingeState correctly', () => {
    expect(UVCDevice.parseStates('engineState', undefined, false)).toBe(false);
    expect(UVCDevice.parseStates('engineState', undefined, true)).toBe(true);
    expect(UVCDevice.parseStates('engineState', undefined, 'Test')).toBe(false);
  });

  it('Parses eventMode correctly', () => {
    expect(UVCDevice.parseStates('eventMode', undefined, false)).toBe(false);
    expect(UVCDevice.parseStates('eventMode', undefined, true)).toBe(true);
    expect(UVCDevice.parseStates('eventMode', undefined, 'Test')).toBe(false);
  });

  it('Parses identifyMode correctly', () => {
    expect(UVCDevice.parseStates('identifyMode', undefined, false)).toBe(false);
    expect(UVCDevice.parseStates('identifyMode', undefined, true)).toBe(true);
    expect(UVCDevice.parseStates('identifyMode', undefined, 'Test')).toBe(false);
  });

  it('Parses tacho correctly', () => {
    expect(UVCDevice.parseStates('tacho', undefined, 1)).toBe(1);
    expect(UVCDevice.parseStates('tacho', undefined, 10)).toBe(10);
    expect(UVCDevice.parseStates('tacho', undefined, 'Test')).toBe(NaN);
  });

  it('Parses airVolume correctly', () => {
    expect(UVCDevice.parseStates('airVolume', undefined, 1)).toBe(1);
    expect(UVCDevice.parseStates('airVolume', undefined, 10)).toBe(10);
    expect(UVCDevice.parseStates('airVolume', undefined, 'Test')).toBe(NaN);
  });

  it('Parses engineLevel correctly', () => {
    expect(UVCDevice.parseStates('engineLevel', undefined, 1)).toBe(1);
    expect(UVCDevice.parseStates('engineLevel', undefined, 10)).toBe(10);
    expect(UVCDevice.parseStates('engineLevel', undefined, 'Test')).toBe(NaN);
  });

  it('Parses alarm correctly', () => {
    const d = UVCDevice.parseStates('alarm', '1', 'Ok');
    expect(d.lamp).toBe(1);
    expect(d.value).toBe('Ok');

    const d1 = UVCDevice.parseStates('alarm', 'True', false);
    expect(d1.lamp).toBe(NaN);
    expect(d1.value).toBe('false');
  });

  it('Parses lamp correctly', () => {
    const d = UVCDevice.parseStates('lamp', '1', 'Ok');
    expect(d.lamp).toBe(1);
    expect(d.value).toBe('Ok');

    const d1 = UVCDevice.parseStates('lamp', 'True', false);
    expect(d1.lamp).toBe(NaN);
    expect(d1.value).toBe('false');
  });
});
