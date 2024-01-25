const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const server = http.createServer(function (req, res) {
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

      res.writeHead(statusCode);
      res.end(payloadString);

      // log what path the user was asking for
      console.log('Returning this response', statusCode, payloadString);
    });
  });
});

server.listen(3000, function () {
  console.log('The server is listening on port 3000 now');
});

const handlers = {};

handlers.sample = function (data, callback) {
  callback(406, { name: 'Sample handler' });
};

handlers.notFound = function (data, callback) {
  callback(404);
};

const routes = {
  sample: handlers.sample,
  notFound: handlers.notFound,
};
