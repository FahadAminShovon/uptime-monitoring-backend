const config = require('./config');
const crypto = require('node:crypto');
const querystring = require('querystring');
const https = require('https');
const path = require('node:path');
const fs = require('node:fs');

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

// Get the string content of a template

helpers.getTemplate = function (templateName, data, callback) {
  templateName =
    typeof templateName === 'string' && templateName.length > 0
      ? templateName
      : false;

  data = typeof data === 'object' && data !== null ? data : {};

  if (templateName) {
    const templatesDir = path.join(__dirname, '/../templates/');
    fs.readFile(
      templatesDir + templateName + '.html',
      'utf-8',
      function (err, str) {
        if (!err && str && str.length > 0) {
          const finalString = helpers.interpolate(str, data);
          callback(false, finalString);
        } else {
          callback('No template could be found');
        }
      }
    );
  } else {
    callback('A valid template name was not specified');
  }
};

// Add the universal header and footer to a string, and pass provided data object to header and footer for interpolation
helpers.addUniversalTemplates = function (str, data, callback) {
  str = typeof str == 'string' && str.length > 0 ? str : '';
  data = typeof data == 'object' && data !== null ? data : {};
  // Get the header
  helpers.getTemplate('_header', data, function (err, headerString) {
    if (!err && headerString) {
      // Get the footer
      helpers.getTemplate('_footer', data, function (err, footerString) {
        if (!err && headerString) {
          // Add them all together
          var fullString = headerString + str + footerString;
          callback(false, fullString);
        } else {
          callback('Could not find the footer template');
        }
      });
    } else {
      callback('Could not find the header template');
    }
  });
};

helpers.interpolate = function (str, data) {
  str = typeof str === 'string' && str.length > 0 ? str : '';
  data = typeof data === 'object' && data !== null ? data : {};

  for (const keyName in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(keyName)) {
      data['global.' + keyName] = config.templateGlobals[keyName];
    }
  }

  for (const key in data) {
    if (data.hasOwnProperty(key) && typeof data[key] === 'string') {
      const replace = data[key];
      const find = `{${key}}`;
      str = str.replace(find, replace);
    }
  }
  return str;
};

// Get the contents of a static (public) asset
helpers.getStaticAsset = function(fileName,callback){
  fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;
  if(fileName){
    var publicDir = path.join(__dirname,'/../public/');
    fs.readFile(publicDir+fileName, function(err,data){
      if(!err && data){
        callback(false,data);
      } else {
        callback('No file could be found');
      }
    });
  } else {
    callback('A valid file name was not specified');
  }
};

module.exports = helpers;
