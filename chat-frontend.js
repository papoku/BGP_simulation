"use strict";

const inputElement = document.getElementById('input');
const contentElement = document.getElementById('content');
const statusElement = document.getElementById('status');

// Connect to the localhost from user end 
var socket = io.connect('http://localhost:1337/');

console.log("socket status:"+socket.connected);

// If the connection is succesfull activate the user interface
$(function () {
    
    socket.on('connect', function() {
        
        inputElement.removeAttribute('disabled');
        inputElement.value = '';
        inputElement.focus();
        statusElement.innerHTML = 'Ready';

        return false;
  });
    
    
    });



// for better performance - to avoid searching in DOM


// my color assigned by the server
var myColor = false;
// my name sent to the server
var myName = false;


// routing table object
function routing_table(router_name, conn_type, hopcount, as){

    var routes = new Object();
    routes["to"] = router_name ;
    routes["type"] = conn_type ;
    routes["hopcount"] = hopcount ;
    routes["as"] = as ;
    
    var routing_table = new Object();
        
    routing_table["as"] = ;
    routing_table["route"] = routes;
    

    //array.push(obj2);

}



//socket.emit('open', "Socket Opened !!");

socket.addEventListener('error', function (error) {
  // just in there were some problems with connection...
  contentElement.innerHTML = '<p>Sorry, but there\'s some problem with your connection, or the server is down.</p>';
});

// most important part - incoming messages
socket.on('message', function (message, fn) {
  // try to parse JSON message. Because we know that the server
  // always returns JSON this should work without any problem but
  // we should make sure that the massage is not chunked or
  // otherwise damaged.
  var json;
  try {
    json = JSON.parse(message);
  } catch (e) {
    console.log('Invalid JSON: ', message);
    return;
  }

  // NOTE: if you're not sure about the JSON structure
  // check the server source code above
  // first response from the server with user's color
  if (json.type === 'color') {
    myColor = json.data;
    statusElement.innerHTML = myName + ': ';
    statusElement.style.color = myColor;
    inputElement.removeAttribute('disabled');
    inputElement.focus();
    // from now user can start sending messages
  } else if (json.type === 'history') {
    // insert every single message to the chat window
    for (var i=0; i < json.data.length; i++) {
      addMessage(json.data[i].author, json.data[i].text, json.data[i].color, new Date(json.data[i].time));
    }
  } else if (json.type === 'message') {
    // let the user write another message
    
    inputElement.removeAttribute('disabled');
    addMessage(json.data.author, json.data.text, json.data.color, new Date(json.data.time));
  } else {
    console.log('Hmm..., I\'ve never seen JSON like this:', json);
  }
});

/**
 * Send message when user presses Enter key
 */
input.addEventListener('keydown', function(e) {
  if (e.keyCode === 13) {
    const msg = inputElement.value;

    if (!msg) {
      return;
    }

    // send the message as an ordinary text
    socket.emit('message', msg, (data) => {
        
        inputElement.value = '';
    });
    

    // disable the input field to make the user wait until server
    // sends back response
    //inputElement.setAttribute('disabled', 'disabled');

    // we know that the first message sent from a user their name
    if (!myName) {
      myName = msg;
    }
  }
});

/**
 * This method is optional. If the server wasn't able to
 * respond to the in 3 seconds then show some error message
 * to notify the user that something is wrong.
 */
setInterval(function() {
  socket.on('disconnect', function() {
    statusElement.innerHTML = 'ERROR';
    inputElement.setAttribute('disabled', 'disabled');
    inputElement.value = 'Unable to communicate with the WebSocket server.';
  });
    
}, 3000);

/**
 * Add message to the chat window
 */
function addMessage(SourceRouter, DestRouter, color, date, ConnType) {
    
    if(ConnType == "connection"){
  contentElement.innerHTML += '<p><span style="color:' + color + '">'
      +'@ ' + (date.getHours() < 10 ? '0'
      + date.getHours() : date.getHours()) + ':'
      + (date.getMinutes() < 10
        ? '0' + date.getMinutes() : date.getMinutes())
      + ':</span> Router ' + SourceRouter + ' is connected to Router ' + DestRouter + '</p>';
        
    }
    else{
        
        contentElement.innerHTML += '<p><span style="color:' + color + '">'
      +'@ ' + (date.getHours() < 10 ? '0'
      + date.getHours() : date.getHours()) + ':'
      + (date.getMinutes() < 10
        ? '0' + date.getMinutes() : date.getMinutes())
      + ':</span> Router ' + SourceRouter + ' is disconnected from Router ' + DestRouter + '</p>';
    }
  contentElement.scrollTop = contentElement.clientHeight;
}