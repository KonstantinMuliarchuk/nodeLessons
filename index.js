/*
* Primary file for the API
*/

//Dependencies
const http = require('http');
const https = require('https')
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var fs = require('fs');
var _data = require('./lib/data');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');


// Instantiate the HTTP server
var httpServer = http.createServer((req, res) => {
    unifiedServer(req,res);  
});

//Start the HTTP server 
httpServer.listen(config.httpPort, () => {
    console.log(`The Server is listening on port ${config.httpPort}`);
})

var httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem')
};

// Instantiate the HTTPS server
var httpsServer = https.createServer(httpsServerOptions,(req, res) => {
    unifiedServer(req,res);  
});

//Start the HTTPS server 
httpsServer.listen(config.httpsPort, () => {
    console.log(`The Server is listening on port ${config.httpsPort}`);
})

// All the server logic for both the http and https servers

var unifiedServer = (req, res) => {
     // Get the url and parse it
     var parsedUrl = url.parse(req.url, true);

     // Get the path
     var path = parsedUrl.pathname;
     var trimmedPath = path.replace(/^\/+|\/+$/g, '');
 
     //Get the query string as an object
     var queryStringObject = parsedUrl.query;
 
     // Get headers as an object
     var headers = req.headers;
 
     // Get the http method
 
     var method = req.method.toLowerCase();
 
     // Get the payload, if any
     var decoder = new StringDecoder('utf-8');
     var buffer = '';
     req.on('data', (data) => {
         buffer += decoder.write(data)
     });
     req.on('end', () => {
         buffer += decoder.end();
 
         // Choose handler this request should go to, if not, go to notFound
         var chosenHandler = router[trimmedPath] ||  router.notFound;
 
         // construct data object to send to handler 
         var data = {
             trimmedPath,
             queryStringObject,
             method,
             headers,
             payload: helpers.parseJsonToObject(buffer) 
         };
 
         //Route the handler to the handler specified in router
         
         chosenHandler(data, (statusCode, payload) => {
             // Use the status code received from handler of use default
             statusCode = typeof (statusCode) == 'number' ? statusCode : 200
 
             // Use the payload received from handler or 
             payload = typeof(payload) == 'object' ? payload : {}
 
             //Convert the payload to string
             var payloadString = JSON.stringify(payload)
 
             //Send the response
             res.setHeader('Content-type', 'application/json');
             res.writeHead(statusCode);
             res.end(payloadString);
 
             //Log the request
             console.log('Returning this response ', statusCode, payloadString);
         })
     });
}


// Define the router
var router = {
    ping: handlers.ping,
    notFound: handlers.notFound,
    hello: handlers.hello,
    users: handlers.users,
    tokens: handlers.tokens
}