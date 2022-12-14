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
    "killer": 0,
    "audio": "audio/Murder-Story-01.mp3"
},
{
    "id": 1,
    "murderhistory": "The police are called to a home in a block of flats where the houses are close together. Inside the house they find a woman named Sophia, dead in her bed, it is the woman's sister who called and summoned the police to the scene. The sister is hysterical. The sister went straight to Sophia's house after her work was calling to know were she was, the door was locked but the car was still parked outside the house. She had to use her spare key to open the lock and enter the house. She called the police immediately when she found Sophia in her bed, she could tell that she was already dead. The police examined the house and the body. No blood, no sign of melee. On the other hand, they could see that she had been strangled with something as she had clear marks around her neck, but they found no murder weapon inside the House. She was wearing a nightgown. It was a hot summer's day and the window was slightly open in the bedroom and that is where they suspects the killer entered. No neighbors had seen or heard anything suspicious. Once inside the police station, you ask a couple of important questions to the sister where valuable information emerged. The sister said that Sophia had had a man who had been stalking her for a long period of time, it wasn't until the last few days that it had started to get really uncomfortable. After an incident with a unknown man, she started receiving mysterious calls in the evenings and nights. She also felt watched most of the time when she was out and about in town, at home and at work.In the last days of her life, she called her sister and was terrified when she had received several envelopes in the mailbox with pictures of her walking around in a nightgown in her own home. Along with the pictures were also love letters. She reported this to the police, who didn't do anything about it. A few days later, she is dead. Who is the mystery man? Can you help the police solve Sophia's murder?   ",
    "killer": 1
},
{
    "id": 2,
    "murderhistory": "empty Mr.Clark",
    "killer": 2
},
{
    "id": 3,
    "murderhistory": "empty Anastasia",
    "killer": 3
}
]



/* application variables
------------------------------- */
// set port number >>> make sure client javascript uses same WebSocket port!
// const port = 80;
const port = 3000;



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

let selectedStory

let selectedStoryId

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

                // H??r skickas en f??rfr??gan till servern fr??n clienten om vilken randomstory som ska presenteras p?? sidan. 
                // Servern skickar tillbaka en random story med hj??lp av Math.random().
                // Clienten rendererar sen ut storyn. 
                selectedStory = murderhistory[Math.floor(Math.random() * murderhistory.length)]

                let selectedMurderHistory = selectedStory.murderhistory

                selectedStoryId = selectedStory.id

                let selectedStoryAudio = selectedStory.audio

                let storyObj = {
                    type: "story",
                    payload: { murderHistory: selectedMurderHistory, playAudio: selectedStoryAudio },
                }


                // console.log('obj.history', obj.payload)

                wss.clients.forEach((client) => {

                    client.send(JSON.stringify(storyObj))
                });

                break;


            case "clues":

                // I clues s?? skickar jag f??rfr??gan fr??n min client med id p?? m??rdarna till servern f??r att ta reda p?? vilken m??rdare som har vilka clues,
                //  servern tar emot f??rfr??gan, genom en find s?? tar jag reda p?? vilket id den m??rdaren har som jag klickat p?? och vilka clues den har
                // sen g??r jag en pop p?? den m??rdarens clues d??r jag tar bort den sista i arrayen och skickar tillbaka den till clienten som tar emot informationen
                // n??r clienten tagit emot ledtr??den, id:t och cluePoints s?? renderar den ut det och skapar element/div d??r clues visas. 

                // Har en cluePoint f??r att r??kna hur m??nga g??nger clienten skickar en f??rfr??gan om clues till servern. 
                // N??r man skickar en f??rfr??gan s?? ska 20 po??ng dras bort fr??n canvas rektangeln, rektangeln inneh??ller 100p fr??n b??rjan, man kan ta ut 5 ledtr??dar innan man f??r Game over.

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

                // Ha en r??knare h??r s?? varje g??ng man fr??gar om en clue s?? ska den dra av po??ng fr??n canvasen 
                // if my counter ??r mindre ??n 10 d?? kan vi forts??tta ge clue, else , skicka en type "Game Over


                break
            case "solveCrime":

                // Skicka f??rfr??gan fr??n clienten till servern om det ??r r??tt m??rdare genom id:t 
                // if och else, true eller false. 

                if (selectedStoryId == obj.payload) {

                    let solveCrimeObj = {
                        type: "solveCrime",
                        payload: obj.payload
                    }

                    wss.clients.forEach((client) => {

                        client.send(JSON.stringify(solveCrimeObj))
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
