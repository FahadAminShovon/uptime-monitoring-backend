/**
 * Create and export configuration variables
 */

// Container all env variables

const envrionments = {};

envrionments.staging = {
  envName: 'staging',
  port: 3000,
};

envrionments.production = {
  envName: 'production',
  port: 5000,
};

const currentEnv =
  typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : '';

const envToExport =
  typeof envrionments[currentEnv] == 'object'
    ? envrionments[currentEnv]
    : envrionments.staging;

console.log('log', envToExport);

module.exports = envToExport;
