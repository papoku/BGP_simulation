
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
                    tap:function() { alert("hey"); }
                }
            }]
        ],
        Container: "thirdddiv"
    });

    var basicType = {
        connector: "StateMachine",
        paintStyle: { stroke: "red", strokeWidth: 4 },
        hoverPaintStyle: { stroke: "blue" },
        overlays: [
            "Arrow"
        ]
        };
       
    firstInstance.registerConnectionType("basic", basicType);
    
    
    var connectorPaintStyle = {
            strokeWidth: 2,
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
             console.log(conn.connection);
             var source = conn.connection.sourceId;
             var target = conn.connection.targetId;
             var msg = "Connection created between router "+ source + " and " + target;
             
             socket.emit('message', msg, (data) => {  
             
                addMessage(source, target, "red", new Date(new Date().getTime()), "connection");
             
             });
        
         });
        
// attch connection detached event when a connection is dropped
        firstInstance.bind("connectionDetached", function(conn, event){
            
            console.log(conn.connection);
            socket.emit('message', "Connectione Detached !", (data) => {  
             
                addMessage(conn.connection.sourceId, conn.connection.targetId, "red", new Date(new Date().getTime()), "detache");
            });
            
        });

        // make all the window divs draggable
        firstInstance.draggable(jsPlumb.getSelector(".router_div"), { grid: [20, 20] });
        // THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector
        // method, or document.querySelectorAll:
        //jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });
        
        
        
        firstInstance.bind("click", function (conn, originalEvent) {
           // if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
             //   instance.detach(conn);
            //conn.toggleType("basic");
        });

        
         firstInstance.bind("connectionDrag", function (connection) {
            console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
        });
        
         firstInstance.bind("connectionDragStop", function (connection) {
            console.log("connection " + connection.id + " was dragged");
        });
        
        firstInstance.bind("connectionMoved", function (params) {
            console.log("connection " + params.connection.id + " was moved");
        });
        
        
    });  
    
    
});


