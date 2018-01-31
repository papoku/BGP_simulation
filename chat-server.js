// Force the pure javascript use
"use strict";

// Title name can be seen in the top of the process. Its otional
process.title = 'node-chat';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

// websocket and http servers
//var webSocketServer = require('socket.io').server;
//var http = require('http');


var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);


/**
 * Global variables
 */
// latest 100 messages
var history = [ ];
// list of currently connected clients (users)
var clients = [ ];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
// ... in random order
colors.sort(function(a,b) { return Math.random() > 0.5; } );



app.get('/', function(req, res){
  res.sendFile(__dirname + '/frontend.html');
    app.use(express.static('./'));
    
});
/**
 * HTTP server
 */
//var server = http.createServer(app);
http.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */



// This callback function is called every time someone
// tries to connect to the WebSocket server
io.on('connection', function(request) {
    
    console.log((new Date()) + ' Connection Success !!');
    
    request.on('disconnect', function(){
    console.log('user disconnected')});
    
    request.on('open', function(msg){
    console.log('message: ' + msg);
    
  });
    

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    //var connection = request.accept(null, request.origin); 
    // we need to know client index to remove them on 'close' event
    var index = clients.push(request) - 1;
    var userName = false;
    var userColor = false;

    console.log((new Date()) + ' Connection accepted.');

    // send back chat history
    if (history.length > 0) {
        request.emit('message',JSON.stringify( { type: 'history', data: history} ));
    }

    // user sent some message
    request.on('message', (message, fn) => {
        
        
//            if (userName === false) { // first message sent by user is their name
//                // remember user name
//                userName = htmlEntities(message);
//                // get random color and send it back to the user
//                userColor = colors.shift();
//                fn('received');
//                request.emit('message', JSON.stringify({ type:'color', data: userColor }));
//                console.log((new Date()) + ' User is known as: ' + userName
//                            + ' with ' + userColor + ' color.');

//            } else { // log and broadcast the message
                console.log((new Date()) + ' : ' + message);
                
                // we want to keep history of all sent messages
//                var obj = {
//                    time: (new Date()).getTime(),
//                    text: htmlEntities(message),
//                    author: userName,
//                    color: userColor
//                };
//                history.push(obj);
//                history = history.slice(-100);
                fn('received');

                // broadcast message to all connected clients
//                var json = JSON.stringify({ type:'message', data: obj });
//                for (var i=0; i < clients.length; i++) {
//                    clients[i].emit('message', json);
//                }
//            }
        
    });

    // user disconnected
    request.on('close', function(conn) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + " Peer "
                + connection.socket.remoteAddress + " disconnected.");
            // remove user from the list of connected clients
            clients.splice(index, 1);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });

});