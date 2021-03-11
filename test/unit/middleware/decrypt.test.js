const fs = require('fs');
const decrypt = require('../../../server/controlModules/MQTTEvents/middleware/decrypt');

describe('Decrypt message', () => {
  it.each([
    ['gAAAAABgSPLwdjMeSqhgM5ussYi3ipUZ1tBDNSwjTbPhVDMx0XAhqL0EwQ8V3oSJ77cx5j-sCQcXTZpjA2D2zaXoh60M7Vwadw==', 'true', 'NQCNtEul3sEuOwMSRExMeh_RQ0iYD0USEemo00G4pCg='],
    ['gAAAAABgSPh8WM8MIMGBG51ulubuQUlz9mSpdLsB7tDqk6GGfGgeTQkbPWaqHj6yG_aYeBCWCnLTl9eIam4y2RC4erWy3GY32w==', 'false', 'NQCNtEul3sEuOwMSRExMeh_RQ0iYD0USEemo00G4pCg='],
    ['gAAAAABgPDFSYPj2eNlD38nCjDJHOl1AfNmYKrcoc4Z61t-PJYAnAU23kOpRKljEhjJ1y34LSRjeeBAKRW7o6gDDU_p0wUJ9Xw==', '33', 'NQCNtEul3sEuOwMSRExMeh_RQ0iYD0USEemo00G4pCg='],
    ['gAAAAABgSdx3tL98l4B6kR4hJQBxGuUa9eTgmSY7K1sNBOCLCI260QCksUBXrz8pVb275P49CCQ6l7GGP-cFGEGOJePlQ7w3-g==', 'false', 'NQCNtEul3sEuOwMSRExMeh_RQ0iYD0USEemo00G4pCg='],
    ['gAAAAABgSfT5_toEhNXK_MKOwnF23258cclSpcOG6N07lGpPlnaJ-KNHfOfTt53VEK6trFww45xt9ffdIxLCLzS0ox_Qsl6P6ALrWdGJQyDEn9jX2uCIgXQ=', '207.54529853716465', 'NQCNtEul3sEuOwMSRExMeh_RQ0iYD0USEemo00G4pCg='],
  ])('Decryptes %s to %s accordingly', (message, payload, secret, done) => {
    fs.writeFileSync('C:/workspace_nodejs/uvclean2000-server/server/ssl/fernetSecret.txt', secret, { encoding: 'base64' });
    // eslint-disable-next-line prefer-const
    let msg = { message };

    decrypt.decrypt(null, null, null, null, msg, () => {});

    expect(msg.message).toMatch(payload);
    done();
  });
});
