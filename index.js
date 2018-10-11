/*
* Primary file for the API
*/

//Dependencies
const http = require('http');
const https = require('https')
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var _data = require('./lib/data')

//Testing
// @TO DO: Delete this
_data.delete('test', 'newFile', (err) => {
    console.log('Error:', err)
})


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
             payload: buffer
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

// Define the handlers 
var handlers = {}

//Sample handler 
handlers.ping = (data, callback) => {

    // callback http code and payload
    callback(200);
}

handlers.hello = (data, callback) => {
    callback(200, {massage: 'Greetings master'})
}

//Not found handler
handlers.notFound = (data, callback) => {

    // not found handler 
    callback(404, {});
}

// Define the router
var router = {
    ping: handlers.ping,
    notFound: handlers.notFound,
    hello: handlers.hello
}