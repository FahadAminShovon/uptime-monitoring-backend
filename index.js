const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const config = require('./config');

const httpServer = http.createServer(function (req, res) {
  unifiedFunction(req, res);
});

const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem'),
};

const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  unifiedFunction(req, res);
});

httpServer.listen(config.httpPort, function () {
  console.log(`The httpServer is listening on httpPort ${config.httpPort} now`);
});

httpsServer.listen(config.httpsPort, function () {
  console.log(
    `The httpServer is listening on httpPort ${config.httpsPort} now`
  );
});

function unifiedFunction(req, res) {
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
      typeof routes[trimmedPath] !== undefined
        ? routes[trimmedPath]
        : routes.notFound;

    const data = {
      trimmedPath,
      headers,
      method,
      payload: buffer,
      queryStringObject,
    };

    chosenHandler(data, function (statusCode, payload) {
      statusCode = typeof statusCode === 'number' ? statusCode : 200;
      payload = typeof payload === 'object' ? payload : {};
      const payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // log what path the user was asking for
      console.log('Returning this response', statusCode, payloadString);
    });
  });
}

const handlers = {};

handlers.ping = function (data, callback) {
  callback(200);
};

handlers.notFound = function (data, callback) {
  callback(404);
};

const routes = {
  ping: handlers.ping,
  notFound: handlers.notFound,
};
