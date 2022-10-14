/* dependencies - imports
------------------------------- */
import express from "express";

// core module http - no npm install...
import http from "http";

// use websocket server
import { WebSocketServer } from "ws";

// import functions
import { parseJSON, broadcast, broadcastButExclude } from "./libs/functions.js";

// import fs from "fs";

// import murderers 
const murderers = [
    {
        "id": 0,
        "image": "url",
        "name": "Mrs Agatha",
        "age": "Age: 72",
        "clues": [
            "Character Trait: Envy",
            "Approach: Food and drinks",
            "Murderweapon: Poison"
        ]
    },
    {
        "id": 1,
        "image": "url",
        "name": "James",
        "age": "Age: 35",
        "clues": [
            "Obsession",
            "Kills his victims while they sleep",
            "Fishing line"
        ]
    },
    {
        "id": 2,
        "image": "url",
        "name": "Mr Clark",
        "age": "Age: 41",
        "clues": [
            "Hate society",
            "Burglary",
            "Pistol"
        ]
    },
    {
        "id": 3,
        "image": "url",
        "name": "Anastasia",
        "age": "Age: 26",
        "clues": [
            "The vengeful",
            "Sneaking forward",
            "Needle with Neurotoxin"
        ]
    }
]
// console.log('murderers', murderers)


// mina tomma array
// const popClues = [];


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

                // message to clients
                let objBroadcast = {
                    type: "text",
                    msg: obj.msg,
                    nickname: obj.nickname,
                };

                // broadcast to all but this ws...
                broadcastButExclude(wss, ws, objBroadcast);

                break;
                case "story":

                let storyObj = {
                    type: "story",
                    payload: obj.payload,
                }

                console.log('obj.history', obj.payload)

                wss.clients.forEach((client) => {

                    client.send(JSON.stringify(storyObj))
                });

                break;
            case "clues":
            
                // använd i obj.paylod.killerId(murder) där är id:t för nuvarande möte, den vill jag hämta nästa clue från med pop() (find måste vara involverad i denna lösning)

                // const currentClue = thisKiller.clues.pop();

                const findMurderer = murderers.find(element => element.id === obj.payload.killerId)

                const clue = findMurderer.clues.pop();

                // popClues.push(clue);

                // när den ena är tom får den pusha in den andra, hitta en lösning på detta. 

                let killerObj = {
                    type: "clues",
                    payload: {clue, killerId: findMurderer.id}
                }

                // console.log('id', findMurderer)

                wss.clients.forEach((client) => {

                    client.send(JSON.stringify(killerObj))
                });

                break
            
            default:
                break;
        }


    });
});

// kommentera ut
// app.get('/api/thekillers', (req, res) => {
//     res.json()
// })

/* listen on initial connection
------------------------------- */
server.listen(port, (req, res) => {
    console.log(`Express server (and http) running on port ${port}`);
});
