/**
 * Create and export configuration variables
 */

// Container all env variables

const envrionments = {};

envrionments.staging = {
  envName: 'staging',
  httpPort: 3000,
  httpsPort: 3001,
};

envrionments.production = {
  envName: 'production',
  httpPort: 5000,
  httpsPort: 5001,
};

const currentEnv =
  typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : '';

const envToExport =
  typeof envrionments[currentEnv] == 'object'
    ? envrionments[currentEnv]
    : envrionments.staging;

module.exports = envToExport;
