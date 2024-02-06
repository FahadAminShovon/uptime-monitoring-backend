const config = require('./config');
const crypto = require('node:crypto');
const querystring = require('querystring');
const https = require('https');

const helpers = {};

helpers.hash = function (str) {
  if (typeof str === 'string' && str.length > 0) {
    const hash = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');
    return hash;
  } else {
    return false;
  }
};

helpers.parseJsonToObject = function (str) {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

helpers.createRandomString = function (strLength) {
  strLength =
    typeof strLength === 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < strLength; i += 1) {
      const randomChar = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      str += randomChar;
    }
    return str;
  } else {
    return false;
  }
};

helpers.sendTwilioSms = function (phone, msg, callback) {
  // Validate parameters
  phone =
    typeof phone == 'string' && phone.trim().length == 10
      ? phone.trim()
      : false;
  msg =
    typeof msg == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (phone && msg) {
    // Configure the request payload
    // Configure the request payload
    const payload = {
      From: config.twilio.fromPhone,
      To: '+1' + phone,
      Body: msg,
    };
    const stringPayload = querystring.stringify(payload);

    const requestDetails = {
      protocol: 'https:',
      host: 'api.twilio.com',
      method: 'POST',
      path:
        '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
      auth: config.twilio.accountSid + ':' + config.twilio.authToken,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload),
      },
    };

    // Instantiate the request object
    const req = https.request(requestDetails, function (res) {
      // Grab the status of the sent request

      const status = res.statusCode;
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback('Status code returned was ' + status);
      }
    });

    req.on('error', function (e) {
      callback(e);
    });

    req.write(stringPayload);

    req.end();
  } else {
    callback('Given parameters were missing or invalid');
  }
};

module.exports = helpers;
