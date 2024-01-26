const fs = require('node:fs');
const path = require('node:path');
const helpers = require('./helpers');

const lib = {};

lib.baseDir = path.join(__dirname, '/../.data/');
// Write data to a file
lib.create = function (dir, file, data, callback) {
  const pathName = `${lib.baseDir}${dir}/${file}.json`;
  fs.open(pathName, 'wx', function (err, fileDescriptor) {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data);
      fs.writeFile(fileDescriptor, stringData, function (err) {
        if (!err) {
          fs.close(fileDescriptor, function (err) {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing new file.');
            }
          });
        } else {
          callback('Error writing to new file.');
        }
      });
    } else {
      console.log(err, fileDescriptor);
      callback('Could not create new file, it may already exist');
    }
  });
};

lib.update = function (dir, file, data, callback) {
  const pathName = `${lib.baseDir}${dir}/${file}.json`;
  fs.open(pathName, 'r+', function (err, fileDescriptor) {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data);
      fs.ftruncate(fileDescriptor, function (err) {
        if (!err) {
          fs.writeFile(fileDescriptor, stringData, function (err) {
            if (!err) {
              fs.close(fileDescriptor, function (err) {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing new file');
                }
              });
            } else {
              callback('Error writing to existing file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Could not open file for updating, it may not exist yet');
    }
  });
};

// Read data from a file
lib.read = function (dir, file, callback) {
  const pathName = `${lib.baseDir}${dir}/${file}.json`;
  fs.readFile(pathName, 'utf-8', function (err, data) {
    if (!err && data) {
      const parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
};

// Delete a file
lib.delete = function (dir, file, callback) {
  const pathName = `${lib.baseDir}${dir}/${file}.json`;
  fs.unlink(pathName, function (err) {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting the file');
    }
  });
};

module.exports = lib;
