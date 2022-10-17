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

const murderhistory = [{
    "id": 0,
    "murderhistory": "The police arrive at a diner where, at first glance, it appears to be a man who has had a heart attack. The man was big and you can tell he hasn't lived a healthy life so a heart attack is very likely. You can't see any external injuries on him so no crime is suspected. Well after the autopsy, a suspicion was raised when it was clearly seen that he had high levels of rat poison in his body, the food was checked from the diner which did not show any poison. He therefore cannot have been poisoned at the diner. Further investigation showed that the man was homeless and that he lived on and off in both shelters and also various cheap boarding houses. Above all, it was a boarding house which was particularly interesting as he had lived there for the past year. It was run by a person who later turned out to have poisoned several people who lived at the boarding house. The police heard from the neighbors that they noticed a lot of activity in the backyard where some digging had been done. The police were able to find up to 10 bodies after a large excavation.Can you solve the case? Who is the killer?",
    "killer": 0
},
{
    "id": 1,
    "murderhistory": "The police are called to a home in a block of flats where the houses are close together. Inside the house they find a woman named Sophia, dead in her bed, it is the woman's sister who called and summoned the police to the scene. The sister is hysterical and has trouble getting words out when the police try to ask her a couple of questions that might give some clue to who the suspect might be. They can't get much out of her other than she came to her sister's house after work called and asked if she had heard anything from Sophia since she hadn't turned up at work that morning. Sophia never misses a day of work, at least not without calling beforehand, which created anxiety in the workplace. The sister went straight to Sophia's house, the door was locked but the car was still parked outside the house. She had to use her spare key to open the lock and enter the house. She called the police immediately when she found Sophia in her bed, the chest was not moving and the lips were completely blue, she could tell she was dead.",
    "killer": 1
},
{
    "id": 2,
    "murderhistory": "The police arrive at a diner where, at first glance, it appears to be a man who has had a heart attack. The man was big and you can tell he hasn't lived a healthy life so a heart attack is very likely. You can't see any external injuries on him so no crime is suspected. Well after the autopsy, a suspicion was raised when it was clearly seen that he had high levels of rat poison in his body, the food was checked from the diner which did not show any poison. He therefore cannot have been poisoned at the diner. Further investigation showed that the man was homeless and that he lived on and off in both shelters and also various cheap boarding houses. Above all, it was a boarding house which was particularly interesting as he had lived there for the past year. It was run by a person who later turned out to have poisoned several people who lived at the boarding house. The police heard from the neighbors that they noticed a lot of activity in the backyard where some digging had been done. The police were able to find up to 10 bodies after a large excavation.Can you solve the case? Who is the killer?",
    "killer": 2
},
{
    "id": 3,
    "murderhistory": "The police arrive at a diner where, at first glance, it appears to be a man who has had a heart attack. The man was big and you can tell he hasn't lived a healthy life so a heart attack is very likely. You can't see any external injuries on him so no crime is suspected. Well after the autopsy, a suspicion was raised when it was clearly seen that he had high levels of rat poison in his body, the food was checked from the diner which did not show any poison. He therefore cannot have been poisoned at the diner. Further investigation showed that the man was homeless and that he lived on and off in both shelters and also various cheap boarding houses. Above all, it was a boarding house which was particularly interesting as he had lived there for the past year. It was run by a person who later turned out to have poisoned several people who lived at the boarding house. The police heard from the neighbors that they noticed a lot of activity in the backyard where some digging had been done. The police were able to find up to 10 bodies after a large excavation.Can you solve the case? Who is the killer?",
    "killer": 3
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
                    payload: {murderHistory: murderhistory[Math.floor(Math.random() * murderhistory.length)].murderhistory},
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

                // Ha en räknare här så varje gång man frågar om en clue så ska den dra av poäng från canvasen 
                // if my counter är mindre än 10 då kan vi fortsätta ge clue, else , skicka en type "Game Over"

                // popClues.push(clue);

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
