/**
 * @fileoverview Example of HTTP/2 client.
 */
var http2 = require('http2');

var client = http2.connect('http://localhost:6000');

// Create a request
var req = client.request({
  ':path': '/',
});

// When a message is received, add the pieces of it together until it's done
var str = '';
req.on('data', function (chunk) {
  str += chunk;
});

// When the message is done, log it out
req.on('end', function () {
  console.log(str);
});

// End the request
req.end();
