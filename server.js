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
        "img": "images/MrsAgatha.png",
        "name": "Mrs Agatha",
        "age": "Age: 72",
        "clues": [
            "Approach: Food and drinks",
            "Murderweapon: Poison",
            "Character Trait: Envy"
        ]
    },
    {
        "id": 1,
        "img": "images/James.png",
        "name": "James",
        "age": "Age: 35",
        "clues": [
            "Murderweapon: Fishing line",
            "Approach: Kills his victims while they sleep",
            "Character Trait: Obsession"
        ]
    },
    {
        "id": 2,
        "img": "images/MrClark.png",
        "name": "Mr Clark",
        "age": "Age: 41",
        "clues": [
            "Approach: Burglary",
            "Murderweapon: Pistol",
            "Character Trait: Hate society"
        ]
    },
    {
        "id": 3,
        "img": "images/Anastasia.png",
        "name": "Anastasia",
        "age": "Age: 26",
        "clues": [
            "Approach: Sneaking forward",
            "Murderweapon: Needle with Neurotoxin",
            "Character Trait: The vengeful"
        ]
    }
]

// import murderhistory
const murderhistory = [{
    "id": 0,
    "murderhistory": "The police arrive at a diner where, at first glance, it appears to be a man who has had a heart attack. The man was big and you can tell he hasn't lived a healthy life so a heart attack is very likely. You can't see any external injuries on him so no crime is suspected. Well after the autopsy, a suspicion was raised when it was clearly seen that he had high levels of rat poison in his body, the food was checked from the diner which did not show any poison. He therefore cannot have been poisoned at the diner. Further investigation showed that the man was homeless and that he lived on and off in both shelters and also various cheap boarding houses. Above all, it was a boarding house which was particularly interesting as he had lived there for the past year. Can you solve the case? Who is the killer?",
    "killer": 0
},
{
    "id": 1,
    "murderhistory": "The police are called to a home in a block of flats where the houses are close together. Inside the house they find a woman named Sophia, dead in her bed, it is the woman's sister who called and summoned the police to the scene. The sister is hysterical and has trouble getting words out when the police try to ask her a couple of questions that might give some clue to who the suspect might be. They can't get much out of her other than she came to her sister's house after work called and asked if she had heard anything from Sophia since she hadn't turned up at work that morning. Sophia never misses a day of work, at least not without calling beforehand, which created anxiety in the workplace. The sister went straight to Sophia's house, the door was locked but the car was still parked outside the house. She had to use her spare key to open the lock and enter the house. She called the police immediately when she found Sophia in her bed, the chest was not moving and the lips were completely blue, she could tell she was dead.",
    "killer": 1
},
{
    "id": 2,
    "murderhistory": "empty",
    "killer": 2
},
{
    "id": 3,
    "murderhistory": "empty",
    "killer": 3
}
]



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

let cluePoint = 100;


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

                // Här skickas en förfrågan till servern från clienten om vilken randomstory som ska presenteras på sidan. 
                // Servern skickar tillbaka en random story med hjälp av Math.random().
                // Clienten rendererar sen ut storyn. 

                let storyObj = {
                    type: "story",
                    payload: { murderHistory: murderhistory[Math.floor(Math.random() * murderhistory.length)].murderhistory },
                }

                console.log('obj.history', obj.payload)

                wss.clients.forEach((client) => {

                    client.send(JSON.stringify(storyObj))
                });

                break;


            case "clues":

                // I clues så skickar jag förfrågan från min client med id på mördarna till servern för att ta reda på vilken mördare som har vilka clues,
                //  servern tar emot förfrågan, genom en find så tar jag reda på vilket id den mördaren har som jag klickat på och vilka clues den har
                // sen gör jag en pop på den mördarens clues där jag tar bort den sista i arrayen och skickar tillbaka den till clienten som tar emot informationen
                // när clienten tagit emot ledtråden, id:t och cluePoints så renderar den ut det och skapar element/div där clues visas. 

                // Har en cluePoint för att räkna hur många gånger clienten skickar en förfrågan om clues till servern. 
                // När man skickar en förfrågan så ska 20 poäng dras bort från canvas rektangeln, rektangeln innehåller 100p från början, man kan ta ut 5 ledtrådar innan man får Game over.

                cluePoint = cluePoint - 20;

                if (cluePoint > 10) {
                    const findMurderer = murderers.find(element => element.id === obj.payload.killerId)

                    const clue = findMurderer.clues.pop();

                    let killerObj = {
                        type: "clues",
                        payload: { clue, killerId: findMurderer.id, points: cluePoint }
                    }


                    wss.clients.forEach((client) => {

                        client.send(JSON.stringify(killerObj))
                    });

                } else {
                    let gameOverObject = {
                        type: "gameOver",
                        payload: true
                    }

                    wss.clients.forEach((client) => {

                        client.send(JSON.stringify(gameOverObject))
                    });
                }

                // Ha en räknare här så varje gång man frågar om en clue så ska den dra av poäng från canvasen 
                // if my counter är mindre än 10 då kan vi fortsätta ge clue, else , skicka en type "Game Over


                break
            case "solveCrime":
                // Skicka förfrågan från clienten till servern om det är rätt mördare genom id:t 
                // if och else, true eller false. 
                
                // måste lägga in en variabel selectedStory så man vet vilken story som är presenterad
                break;

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
