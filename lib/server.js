const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const path = require('path');
const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');

const server = {};

server.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, '../https/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../https/cert.pem')),
};

server.httpServer = http.createServer(function (req, res) {
  server.unifiedFunction(req, res);
});

server.httpsServer = https.createServer(
  server.httpsServerOptions,
  function (req, res) {
    server.unifiedFunction(req, res);
  }
);

server.unifiedFunction = function (req, res) {
  // Get the url and parse it
  const parsedUrl = url.parse(req.url, true);

  // Get the path from the url
  const path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  const queryStringObject = parsedUrl.query;

  // Get the http method
  const method = req.method.toLowerCase();

  const headers = req.headers;

  // Get payloads if there is any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', function (data) {
    buffer += decoder.write(data);
  });

  req.on('end', function () {
    // Send response
    buffer += decoder.end();

    // Choose the handler the request should go to, If one is not found use the notFound handler
    const chosenHandler =
      typeof server.routes[trimmedPath] !== 'undefined'
        ? server.routes[trimmedPath]
        : server.routes.notFound;

    const data = {
      trimmedPath,
      headers,
      method,
      payload: helpers.parseJsonToObject(buffer),
      queryStringObject,
    };

    chosenHandler(data, function (statusCode, payload) {
      statusCode = typeof statusCode === 'number' ? statusCode : 200;
      payload = typeof payload === 'object' ? payload : {};
      const payloadString = JSON.stringify(payload);
      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      // log what path the user was asking for
      console.log('Returning this response', statusCode, payloadString);
    });
  });
};

server.routes = {
  ping: handlers.ping,
  notFound: handlers.notFound,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks,
};

server.init = function () {
  server.httpServer.listen(config.httpPort, function () {
    console.log(
      `The httpServer is listening on httpPort ${config.httpPort} now`
    );
  });

  server.httpsServer.listen(config.httpsPort, function () {
    console.log(
      `The httpServer is listening on httpPort ${config.httpsPort} now`
    );
  });
};

// Export the module
module.exports = server;
