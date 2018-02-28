# BGP_simulation

This is a routing simulation program I did as a part of a academic course project. Efficient tree traversal is the main idea behind this development. At least 9 routers has been taken to demonstrate the protocol. Connection can be created and deleted between routers, and message can be sent between them with best path selection. Node.js has been using at backend as a server for real time simulation environment, though 75% of the work has been done in client end.

**Currently ..**
* Connection can be created and deleted
* Clicking on a connection will make it short
* Routers are draggable
* Routing table will be updated after each 10 seconds and inactive routes will be deleted from each router
* Message can be sent with best path
* If best path is deleted the router will automatically calculate next best path to reach to the destination
* Prevent loop in routing table around 50%
* At least a 10 seconds or more is necessary to wait after a connection is created or deleted to take effect in routing table else message sending between routers might not take the best path
* If the connection with server is not active staus "Ready" will turn into "Error" and vice versa

**Tools used:**
* Node.js
* Javascript
* Jsplumb (javascript library)
* HTML and CSS

**Screenshots**

![Landing Page](https://github.com/papoku/BGP_simulation/blob/master/screenshots/ss-4.jpg)
#
![with_connection](https://github.com/papoku/BGP_simulation/blob/master/screenshots/ss-1.jpg)
#
![best_path_green](https://github.com/papoku/BGP_simulation/blob/master/screenshots/ss-2.jpg)
#
![best_path_green](https://github.com/papoku/BGP_simulation/blob/master/screenshots/ss-3.jpg)
