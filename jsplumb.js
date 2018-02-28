
$(document).ready(function() {
                  
       var firstInstance = jsPlumb.getInstance({
        // default drag options
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
        // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
        ConnectionOverlays: [
            
            [ "Label", {
                location: 0.5,
                id: "label",
                cssClass: "connectionlabel",
                events:{
                    //tap:function() { alert("hey"); }
                }
            }]
        ],
        Container: "thirdddiv"
    });

    var stateMachineType = {
        connector: ["StateMachine", {margin: 10}],
        paintStyle: { stroke: "#e35c85", strokeWidth: 3 },
        hoverPaintStyle: { stroke: "#216477" },
        overlays: [
            "Arrow"
        ]
        };
       
    firstInstance.registerConnectionType("statemachine", stateMachineType);
    
    
    var connectorPaintStyle = {
            strokeWidth: 5,
            stroke: "#e35c85",
            joinstyle: "round",
            outlineStroke: "white",
            outlineWidth: 2
        },
    // .. and this is the hover style.
        connectorHoverStyle = {
            strokeWidth: 3,
            stroke: "#216477",
            outlineWidth: 5,
            outlineStroke: "white"
        },
        endpointHoverStyle = {
            fill: "#216477",
            stroke: "#216477"
        },
    // the definition of source endpoints (the small blue ones)
        sourceEndpoint = {
            endpoint: "Dot",
            paintStyle: {
                stroke: "#7AB02C",
                fill: "transparent",
                radius: 7,
                strokeWidth: 1
            },
            isSource: true,
            connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
            connectorStyle: connectorPaintStyle,
            hoverPaintStyle: endpointHoverStyle,
            connectorHoverStyle: connectorHoverStyle,
            dragOptions: {},
            overlays: [
                [ "Label", {
                    location: [0.4, 1.5],
                    label: "Drag",
                    cssClass: "endpointLabel",
                    visible:false
                } ]
            ]
        },
    // the definition of target endpoints (will appear when the user drags a connection)
        targetEndpoint = {
            endpoint: "Dot",
            paintStyle: { fill: "#7AB02C", radius: 7 },
            hoverPaintStyle: endpointHoverStyle,
            maxConnections: -1,
            dropOptions: { hoverClass: "hover", activeClass: "active" },
            isTarget: true,
            overlays: [
                [ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointLabel", visible:false } ]
            ]
        },
        
        init = function (connection) {
            connection.getOverlay("label").setLabel(connection.sourceId + "-" + connection.targetId);
        };

    var addEndpointsIntoRouter = function (toId, sourceAnchors, targetAnchors) {
        
        for (var i = 0; i < sourceAnchors.length; i++) {
            var sourceUUID = toId + sourceAnchors[i];
            firstInstance.addEndpoint(toId, sourceEndpoint, {
                anchor: sourceAnchors[i], uuid: sourceUUID
            });
        }
        
        for (var j = 0; j < targetAnchors.length; j++) {
            var targetUUID = toId + targetAnchors[j];
            firstInstance.addEndpoint(toId, targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
        }
    };
    
 
    
// Add interfaces in the face of routers   
    firstInstance.batch(function () {

        addEndpointsIntoRouter("R1", ["TopCenter", "BottomCenter"], ["LeftMiddle", "RightMiddle"]);
        addEndpointsIntoRouter("R2", ["LeftMiddle", "BottomCenter"], ["TopCenter", "RightMiddle"]);
        addEndpointsIntoRouter("R3", ["TopCenter", "BottomCenter"], ["LeftMiddle", "RightMiddle"]);
       
        addEndpointsIntoRouter("R4", ["TopCenter", "BottomCenter"], ["LeftMiddle", "RightMiddle"]);
        addEndpointsIntoRouter("R5", ["LeftMiddle", "BottomCenter"], ["TopCenter", "RightMiddle"]);
        addEndpointsIntoRouter("R6", ["TopCenter", "BottomCenter"], ["LeftMiddle", "RightMiddle"]);
        
        addEndpointsIntoRouter("R7", ["TopCenter", "BottomCenter"], ["LeftMiddle", "RightMiddle"]);
        addEndpointsIntoRouter("R8", ["LeftMiddle", "BottomCenter"], ["TopCenter", "RightMiddle"]);
        addEndpointsIntoRouter("R9", ["TopCenter", "BottomCenter"], ["LeftMiddle", "RightMiddle"]);
        
    // attach a connection event 
         firstInstance.bind("connection", function (conn, event) {
            
             init(conn.connection);
             console.log(conn.connection.connector.type);
             var source = conn.connection.sourceId;
             var target = conn.connection.targetId;
             var msg = "Connection created between router "+ source + " and " + target;
                
    //make routing table entry for target router
             var new_route_json = JSON.parse(new_route(target, "D", 0, check_autonomous_system(target),"", source));
             add_routes_into_routing_table(JSON.stringify({router: source, as: check_autonomous_system(source), routes: new_route_json}));
             
    //make routing table entry for source router
             new_route_json = JSON.parse(new_route(source, "D", 0, check_autonomous_system(source),"", target));
             add_routes_into_routing_table(JSON.stringify({router: target, as: check_autonomous_system(target), routes: new_route_json}));
             
    //update_routes_in_routing_table();
             
             socket.emit('message', msg, (data) => {  
             
                addMessage(source, target, "red", new Date(new Date().getTime()), "connection");
             
             });
             
             //mark_path(R2, R3);
//             
             
        
         });
        
// attch connection detached event when a connection is dropped
        firstInstance.bind("connectionDetached", function(conn, event){
            
            console.log(conn.connection);
            
            var source_router = conn.connection.sourceId;
            var target_router = conn.connection.targetId;
            
            socket.emit('message', "Connectione Detached !", (data) => {
                
                addMessage(source_router, target_router, "red", new Date(new Date().getTime()), "detache");
                  
            });
            
            
            
            // Delete route entry from source router    
                delete_route_entry(source_router, target_router);
                
                
            // Delete route entry from target router
                delete_route_entry(target_router, source_router);
            
        });

        
        
        // make all the window divs draggable
        firstInstance.draggable(jsPlumb.getSelector(".router_div"), { grid: [20, 20] 
                                                                    });
        
        
        
        
        firstInstance.bind("click", function (conn, originalEvent) {
            
            if(conn.connector.type == "StateMachine")
               {
                   if (confirm("Delete this "+ conn.sourceId +"--"+ conn.targetId + " connection? "))
                       firstInstance.deleteConnection(conn);
               
               }               
            
            if(conn.connector.type == "Flowchart")
                conn.toggleType("statemachine");
            
        });

        
//         firstInstance.bind("connectionDrag", function (connection) {
//            
//             console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
//        
//         });
        
         
//        firstInstance.bind("connectionDragStop", function (connection) {
//            
//             console.log("connection " + connection.id + " was dragged");
//        
//         });
//        
//        
//        firstInstance.bind("connectionMoved", function (params) {
//            
//            console.log("connection " + params.connection.id + " was moved");
//        
//        });
            
    
    
      
    

    
//Mark the best route selected while making routing decision to send message between two routers
    function mark_path(source_router, dest_router)
    {
       
       firstInstance.select({source:source_router,target:dest_router}).setPaintStyle({
            stroke:"green", 
            strokeWidth:5 

        });
        
        
        firstInstance.select({source:dest_router,target:source_router}).setPaintStyle({
            stroke:"green", 
            strokeWidth:5 

        });
        
        
    }
    
    
    
// reset all connections to default color
        
    function reset_connection_color()
        {
                firstInstance.select().setPaintStyle({
                    
                    stroke:"#e35c85", 
                    strokeWidth:5 
                
                });
        }
        
    
        
    
//text change even for router selection to send message
    $( "#submit" ).click(function() {

        var from = $("#routers_from").val();
        var to = $("#routers_to").val();

        if(typeof from != "undefined" && typeof to != "undefined" && from != to)
            {
                reset_connection_color();
                var decision = routing_decision(from, to);
                console.log("message sent !!");


                if(decision.best_path == from && decision.hopcount == 0)
                    {
                        console.log("inside direct !!");
                        //reset_connection_color();
                        mark_path(from, to);
                    }



                while(decision.hopcount != 0 && typeof decision.hopcount != "undefined")
                {

                    console.log("inside via !! " );

                    mark_path(from, decision.best_path);
                    from = decision.best_path;
                    decision = routing_decision(decision.best_path, to);

                }

                if(decision.hopcount == 0)
                {
                    //reset_connection_color();
                    mark_path(from, to);
                }


            }
        else
            reset_connection_color();

    });
    
     

});

});





