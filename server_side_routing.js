// ensure use of pure javascript
"use strict";


// Port number using for node server
var webSocketsServerPort = 1337;


// declaration of express web server and http instances for server and client side communication
var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);



//Listen for any request comes to '/' URL
app.get('/', function(req, res){
  res.sendFile(__dirname + '/frontend.html');
    app.use(express.static('./'));
    
});


// Webserver strats listening on assigned port for any incoming request
http.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});




// every time a new connection request comes in server following code will be executed
io.on('connection', function(request) {
    
    console.log((new Date()) + ' Connection Success !!');
    
    request.on('disconnect', function()
    {
        console.log('user disconnected');
    });
    
    request.on('open', function(msg)
    {
        console.log('message: ' + msg); 
    });
    

    console.log((new Date()) + ' Connection accepted.');


    // listen for incoming message from client-side
    request.on('message', (message, fn) => {
        
                console.log((new Date()) + ' : ' + message);
                
                fn('received');
        
    });


});