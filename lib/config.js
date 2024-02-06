/**
 * Create and export configuration variables
 */

// Container all env variables

const envrionments = {};

envrionments.staging = {
  envName: 'staging',
  httpPort: 3000,
  httpsPort: 3001,
  hashingSecret: 'hashingSecret',
  maxChecks: 5,
  twilio: {
    accountSid: 'ACb32d411ad7fe886aac54c665d25e5c5d',
    authToken: '9455e3eb3109edc12e3d8c92768f7a67',
    fromPhone: '+15005550006',
  },
};

envrionments.production = {
  envName: 'production',
  httpPort: 5000,
  httpsPort: 5001,
  hashingSecret: 'prodHashingSecret',
  maxChecks: 5,
  twilio: {
    accountSid: '',
    authToken: '',
    fromPhone: '',
  },
};

const currentEnv =
  typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : '';

const envToExport =
  typeof envrionments[currentEnv] == 'object'
    ? envrionments[currentEnv]
    : envrionments.staging;

module.exports = envToExport;
