"use strict";

const contentElement = document.getElementById('content');
const statusElement = document.getElementById('status');

// Connect to the localhost from user end 
var socket = io.connect('http://localhost:1337/');

console.log("socket status:"+socket.connected);


// If the connection is succesfull activate the user interface
$(function () {
    
    socket.on('connect', function() {
        
        statusElement.innerHTML = 'Ready';
        return false;
    });  
    
});



// for better performance - to avoid searching in DOM


//// my color assigned by the server
//var myColor = false;
//// my name sent to the server
//var myName = false;


var routing_table = new Object();

//creating route entries in central routing table for route dicisions
function add_routes_into_routing_table(json){
    
    json = JSON.parse(json);
    var route_entry = new Object();
    
    if(routing_table.hasOwnProperty(json.router))
    {
        routing_table[json.router].routes.push(json.routes);
    }
    else
    {
        var routes = [];
        routes.push(json.routes);
        route_entry.as = json.as;
        route_entry.routes = routes;
        routing_table[json.router] = route_entry;
        
    }
    
}


// creating a new route object for any new connection between routers
function new_route(router_name, conn_type, hopcount, as, via, originator){

    var routes = new Object();
    routes["to"] = router_name ;
    routes["type"] = conn_type ;
    routes["hopcount"] = hopcount ;
    routes["as"] = as ;
    routes["via"] = via;
    routes["time"] = new Date().getTime();
    routes["path_originator"] = originator;
    
    return JSON.stringify(routes);


}


// function that delete route_entry from routing_table
function delete_route_entry(source_router, target_router)
{
    
    var index = routing_table[source_router].routes.length;
    
    for(var i =0; i<= index; i++)
        {
            var routes = routing_table[source_router].routes;
            
            for(var item in routes)
                    {
                        if(routes[item].to == target_router && routes[item].type == "D" || routes[item].via == target_router) 
                        {
                            
                            routing_table[source_router].routes.splice(item, 1);
                            
                            break;
                            
                        }
                        
                    }      
            
        }
                        
}


//check router id which autonomos system it belongs to
function check_autonomous_system(target){
    
    var as;
    if (target == "R1" || target == "R2" || target == "R3")
             {
                 as = 100;
             }
             else if(target == "R4" || target == "R5" || target == "R6")
             {
                 as = 200;
             }
             else
                 as = 300;
    
    return as;
}




//update routes from connected routers in routing table
function update_routes_in_routing_table()
{
    var t1 = performance.now();
    if(Object.keys(routing_table).length)
        {
            for(var routers in routing_table) 
            {
                var routes = routing_table[routers].routes;
                
                if(Object.keys(routes).length)
                {
                    for(var item in routes)
                    {
                        
                        if(routes[item].type == "D") 
                        {
                            
                            var via_routes = routing_table[routes[item].to].routes;
                            
                            for(var keys in via_routes)
                            {
                                
                                var new_entry_route; 
                                
                                if(via_routes[keys].type == "D" && via_routes[keys].to != routers)
                                {
                                    
                                    if(route_existance(routers, via_routes[keys].to, via_routes[keys].type, via_routes[keys].via, routes[item].to, via_routes[keys].path_originator))
                                    {
                                        new_entry_route = JSON.parse(new_route(via_routes[keys].to, "via", 1, via_routes[keys].as, routes[item].to, via_routes[keys].path_originator));                    
                                        
                                        add_routes_into_routing_table(JSON.stringify({router: routers, as: check_autonomous_system(routers), routes: new_entry_route}));
                                    }
                                    
                                    
                                }
                                else if(via_routes[keys].type == "via" && via_routes[keys].to != routers)
                                {
                                    
                                                                       
                                    if(route_existance(routers, via_routes[keys].to, via_routes[keys].type, via_routes[keys].via, routes[item].to, via_routes[keys].path_originator))
                                    {
                                        
                                         var hop = parseInt(via_routes[keys].hopcount) +1;
                                        new_entry_route = JSON.parse(new_route(via_routes[keys].to, "via", hop, via_routes[keys].as, routes[item].to, via_routes[keys].path_originator));
                                        
                                        add_routes_into_routing_table(JSON.stringify({router: routers, as: check_autonomous_system(routers), routes: new_entry_route}));
                                    }
                                    
                                    
                                }                  
                                
                            }
                            
                        }
                    }
                }
            }
            
            console.log("Traversing Finished !!");
            //console.log(routing_table);
        }
    console.log(routing_table);
    var t2 = performance.now();
    console.log(t2-t1);
}




// function that checks for inactive routes in routing table and delete
function delete_inactive_routes()
{
    var flag;
    if(Object.keys(routing_table).length)
        {
            for(var routers in routing_table) 
            {
                var routes = routing_table[routers].routes;
                
                if(Object.keys(routes).length)
                {
                    for(var item in routes)
                    {
                        
                        flag = false;
                        if(routes[item].type == "via") 
                        {
                            var via_routes = routing_table[routes[item].via].routes;
                            
                            for(var keys in via_routes)
                            {
                                
                                var hop_difference = parseInt(routes[item].hopcount)- parseInt(via_routes[keys].hopcount);
                                
                                if(routes[item].to == via_routes[keys].to && via_routes[keys].via != routers && hop_difference == 1)
                                    {
                                        flag = true;
                                        
                                        break;
                                    }
                                    
                                    
                            }
                            
                            if(!flag)
                                routing_table[routers].routes.splice(item, 1);
                        }
                    }
                }
            }
        }
}



// Check if the route exist already in routing table
function route_existance(source, to, type, via, via_origin, path_originator)
{
   
    var flag = true;
    var routes = routing_table[source].routes;

    for(var route in routes)
    {
        if(routes[route].to == to && source == via)
        {
            flag = false;
            break;
        }
        else if (routes[route].to == to && routes[route].via == via_origin)
        {
            flag = false;
            break;
        }
        else if(source == path_originator)
        {
            flag = false;
            break;
        }
        
    }
    
    return flag;
}



// function that search in routing table recursively for best route to send message from one router to another
function routing_decision(from, to)
{
    var routes = routing_table[from].routes;
    var best_path;
    var hopcount;
    
    for(var item in routes)
        {
            if(routes[item].to == to && routes[item].type == "D")
                {
                    //mark_path(from, to);
                    best_path = from;
                    hopcount = parseInt(routes[item].hopcount);
                }
            else if(routes[item].to == to && routes[item].type == "via")
                {
                    if(typeof hopcount == "undefined")
                        {
                            hopcount = parseInt(routes[item].hopcount);
                            best_path = routes[item].via;
                            
                        }
                    else
                        {
                            if(hopcount > parseInt(routes[item].hopcount))
                                {
                                    hopcount = parseInt(routes[item].hopcount);
                                    best_path = routes[item].via;
                                    
                                }
                        }
                }
        }
    
    
    
    console.log("Via: "+best_path+" hopcount: "+hopcount);
    return {best_path: best_path, hopcount:  hopcount};
    
    
}

    

// Automtically exceute functions to update and delete inactive routes
setInterval( function () {
    
    update_routes_in_routing_table();
    delete_inactive_routes();
}, 15000 );


// delete inactive routes known from other routers
setInterval( function () {
    
    delete_inactive_routes();
    
}, 7000 );



// auto check after each 3 second the connection is active with server
setInterval(function() {
  
    socket.on('disconnect', function() {
        statusElement.innerHTML = 'ERROR';
    });
    
}, 3000);



socket.addEventListener('error', function (error) {
  // just in there were some problems with connection...
  contentElement.innerHTML = 'Connection error !!';
});



// Add message to the window in user interface
function addMessage(SourceRouter, DestRouter, color, date, ConnType) 
{
    
    if(ConnType == "connection"){
  contentElement.innerHTML += '<p><span style="color:' + color + '">'
      +'@ ' + (date.getHours() < 10 ? '0'
      + date.getHours() : date.getHours()) + ':'
      + (date.getMinutes() < 10
        ? '0' + date.getMinutes() : date.getMinutes())
      + ':</span> Router <span style="color: Red">' + SourceRouter + '</span> is connected to Router <span style="color: Red">' + DestRouter + '</span> </p>';
        
    }
    else{
        
        contentElement.innerHTML += '<p><span style="color:' + color + '">'
      +'@ ' + (date.getHours() < 10 ? '0'
      + date.getHours() : date.getHours()) + ':'
      + (date.getMinutes() < 10
        ? '0' + date.getMinutes() : date.getMinutes())
      + ':</span> Router <span style="color: Red">' + SourceRouter + '</span> is disconnected from Router <span style="color: Red">' + DestRouter + '</span> </p>';
    }
  contentElement.scrollTop = contentElement.clientHeight;

}

