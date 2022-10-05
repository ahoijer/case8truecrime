/* dependencies - imports
------------------------------- */
import express from "express";

// core module http - no npm install...
import http from "http";

// use websocket server
import { WebSocketServer } from "ws";

// import functions
import { parseJSON, broadcast, broadcastButExclude } from "./libs/functions.js";



/* application variables
------------------------------- */
// set port number >>> make sure client javascript uses same WebSocket port!
const port = 80; 



/* express
------------------------------- */
// express 'app' environment
const app = express();

// serve static files - every file in folder named 'public'
app.use(express.static("public"));



/* server(s)
------------------------------- */
// use core module http and pass express as an instance
const server = http.createServer(app);

// create WebSocket server - use a predefined server
const wss = new WebSocketServer({ noServer: true });



/* allow websockets - listener
------------------------------- */
// upgrade event - websocket communication
server.on("upgrade", (req, socket, head) => {
    console.log("Upgrade event client: ", req.headers);

    // use authentication - only logged in users allowed ?
    // socket.write('HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Basic\r\n\r\n');
    // socket.destroy();
    // return;

    // start websocket
    wss.handleUpgrade(req, socket, head, (ws) => {
        console.log("let user use websocket...");

        wss.emit("connection", ws, req);
    });
});



/* listen on new websocket connections
------------------------------- */
wss.on("connection", (ws) => {
    console.log("New client connection from IP: ", ws._socket.remoteAddress);
    console.log("Number of connected clients: ", wss.clients.size);

    // WebSocket events (ws) for single client

    // close event
    ws.on("close", () => {
        console.log("Client disconnected");
        console.log(
            "Number of remaining connected clients: ",
            wss.clients.size
        );
    });

    // message event
    ws.on("message", (data) => {
        // console.log('Message received: %s', data);

        let obj = parseJSON(data);

        // todo
        // use obj property 'type' to handle message event
        switch (obj.type) {
            case "text":
                break;
            case "somethingelse":
                break;
            default:
                break;
        }

        // message to clients
        let objBroadcast = {
            type: "text",
            msg: obj.msg,
            nickname: obj.nickname,
        };

        // broadcast to all but this ws...
        broadcastButExclude(wss, ws, objBroadcast);
    });
});



/* listen on initial connection
------------------------------- */
server.listen(port, (req, res) => {
    console.log(`Express server (and http) running on port ${port}`);
});
