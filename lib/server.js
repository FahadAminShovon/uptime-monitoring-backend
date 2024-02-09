const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const path = require('path');
const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');
const util = require('node:util');
const debug = util.debuglog('server');

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

    chosenHandler(data, function (statusCode, payload, contentType) {
      contentType = typeof contentType === 'string' ? contentType : 'json';
      statusCode = typeof statusCode === 'number' ? statusCode : 200;

      let payloadString = '';
      if (contentType === 'json') {
        res.setHeader('Content-Type', 'application/json');
        payload = typeof payload === 'object' ? payload : {};
        payloadString = JSON.stringify(payload);
      }
      if (contentType === 'html') {
        res.setHeader('Content-Type', 'text/html');
        payloadString = typeof payload === 'string' ? payload : '';
      }

      // Return the response
      res.writeHead(statusCode);
      res.end(payloadString);
      // log what path the user was asking for
      // If the response is 200, print green, otherwise print red
      if (statusCode == 200) {
        debug(
          '\x1b[32m%s\x1b[0m',
          method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode
        );
      } else {
        debug(
          '\x1b[31m%s\x1b[0m',
          method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode
        );
      }
    });
  });
};

server.routes = {
  '': handlers.index,
  'account/create': handlers.accountCreate,
  'account/edit': handlers.accountEdit,
  'account/deleted': handlers.accountDeleted,
  'session/create': handlers.sessionCreate,
  'session/deleted': handlers.sessionDeleted,
  'checks/all': handlers.checksList,
  'checks/create': handlers.checksCreate,
  'checks/edit': handlers.checksEdit,
  ping: handlers.ping,
  notFound: handlers.notFound,
  'api/users': handlers.users,
  'api/tokens': handlers.tokens,
  'api/checks': handlers.checks,
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
