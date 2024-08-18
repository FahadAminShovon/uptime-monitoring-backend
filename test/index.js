/**
 * Test runner
 */

// override the NODE_ENV variable
process.env.NODE_ENV = 'testing';

// Application logic for the test runne
_app = {};

// Container for the test
_app.tests = {};

_app.tests.unit = require('./unit');
_app.tests.api = require('./api');

// Count all the tests
_app.countTests = function () {
  var counter = 0;
  for (var key in _app.tests) {
    if (_app.tests.hasOwnProperty(key)) {
      var subTests = _app.tests[key];
      for (var testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          counter++;
        }
      }
    }
  }
  return counter;
};

_app.runTests = function () {
  var errors = [];
  var success = 0;
  var limit = _app.countTests();
  var counter = 0;
  for (var key in _app.tests) {
    if (_app.tests.hasOwnProperty(key)) {
      var subTests = _app.tests[key];
      for (var testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          (function () {
            var tmpTestName = testName;
            var testValue = subTests[testName];
            try {
              testValue(function () {
                console.log('\x1b[32m%s\x1b[0m', tmpTestName);
                counter++;
                success++;
                if (counter == limit) {
                  _app.produceTestReport(limit, success, errors);
                }
              });
            } catch (e) {
              errors.push({
                name: testName,
                error: e,
              });
              console.log('\x1b[31m%s\x1b[0m', tmpTestName);
              counter++;
              if (counter == limit) {
                _app.produceTestReport(limit, success, errors);
              }
            }
          })();
        }
      }
    }
  }
};

// Run the tests

// Product a test outcome report
_app.produceTestReport = function (limit, success, errors) {
  console.log('');
  console.log('--------BEGIN TEST REPORT--------');
  console.log('');
  console.log('Total Tests: ', limit);
  console.log('Pass: ', success);
  console.log('Fail: ', errors.length);
  console.log('');

  // If there are errors, print them in detail
  if (errors.length > 0) {
    console.log('--------BEGIN ERROR DETAILS--------');
    console.log('');
    errors.forEach(function (testError) {
      console.log('\x1b[31m%s\x1b[0m', testError.name);
      console.log(testError.error);
      console.log('');
    });
    console.log('');
    console.log('--------END ERROR DETAILS--------');
  }

  console.log('');
  console.log('--------END TEST REPORT--------');
  process.exit(0);
};

_app.runTests();
