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
    res.end('Hello world\n');

    // log what path the user was asking for
    console.log(
      `Request received on path: ${trimmedPath} with method: ${method} with parameters 
      ${JSON.stringify(queryStringObject)} with payload ${buffer}`
    );

    console.log('Request received with these headers', headers);
  });
});

server.listen(3000, function () {
  console.log('The server is listening on port 3000 now');
});
