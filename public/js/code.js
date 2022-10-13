// DOM elements
const inputText = document.getElementById("inputText");
const setNickname = document.querySelector("#setNickname");

const murderStory = document.getElementById('murderStory');
const killerInfo = document.getElementById('killerInfo');

const getYourStoryBtn = document.getElementById('getYourStory');

const canvas = document.getElementById('rectangle');
const ctx = canvas.getContext('2d');

// variable current user | nickname
let nickname;

// count clues and points
let count = 0;

async function Init() {


    // use WebSocket >>> make sure server uses same ws port!
    const websocket = new WebSocket("ws://localhost:80");


    // lägg in en fetch
    const response1 = await fetch('thekillers.json')
    const killer = await response1.json()

    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    const response2 = await fetch('murderhistory.json')
    const murderhistory = await response2.json()

    console.log('murderhistory', murderhistory)

    function pickRandomStory() {
        // console.log(murderhistory[Math.floor(Math.random()*murderhistory.length)].murderhistory)
        const myStory = document.createElement('div');

        let pTagStory = document.createElement('p');

        let mStory = murderhistory[Math.floor(Math.random() * murderhistory.length)].murderhistory

        pTagStory.innerText = mStory;

        myStory.appendChild(pTagStory);

        murderStory.appendChild(myStory);

                websocket.send(JSON.stringify({ type: "story", payload: mStory }))


        return murderhistory[Math.floor(Math.random() * murderhistory.length)].murderhistory;

    }

    // pickRandomStory();


    getYourStoryBtn.addEventListener('click', () => {
        pickRandomStory();
        // let mStory = pickRandomStory();

        // websocket.send(JSON.stringify({ type: "story", payload: mStory }))

    })


    // DENNA MAP FUNKTION MAPPAR UT MINA MÖRDARE PÅ HEMSIDAN


    killer.map((thisKiller) => {

        //CREATE DIV FOR MY KILLERS
        //skapa ett unikt id för varje myKillers, sen nere i renderclue ska jag kalla på id:t för diven
        const myKillers = document.createElement('div');
        myKillers.setAttribute('id', 'm' + count++);


        // CREATE H2 TAG FOR THE NAME OF THE KILLER
        let h2Name = document.createElement('h2');
        let ptAge = document.createElement('p');
        let buttonClue = document.createElement('button');


        //namnge min prop till något rimligt

        const murderer = {
            killerId: thisKiller.id
        }
        // Murderer visar fyra objekt med ett varsitt id 0-3.
        console.log('murderer', murderer)

        buttonClue.addEventListener('click', () => {

            // const currentClue = thisKiller.clues.pop();
            // console.log('currentclue', currentClue, thisKiller)

            // här menar Henry att jag bör stoppa in Id:t för mördaren istället och sen göra en pop på server-sidan för att inte få ut dubbletter på min DOM
            // websocket.send(JSON.stringify({ type: "clues", payload: [currentClue, thisKiller]}))
            websocket.send(JSON.stringify({ type: "clues", payload: murderer }))


        })

        // DECLARE WHAT MY h2Name SHOULD CONTAIN
        h2Name.innerText = thisKiller.name;
        ptAge.innerText = thisKiller.age;
        buttonClue.innerText = 'Get clue';

        // WHAT SHOULD MYKILLERS CONTAIN
        myKillers.appendChild(h2Name);
        myKillers.appendChild(ptAge)
        myKillers.appendChild(buttonClue);

        // ADD myKillers TO MY BIG DIV killerInfo
        killerInfo.appendChild(myKillers);


    })


    function renderClue(killerId, clue) {
        //???? VAD GÖR JAG???
        const clueAndKiller = document.createElement('div');

        clueAndKiller.innerText = clue;

        document.getElementById('m' + killerId).appendChild(clueAndKiller)

        // console.log('thiskiller id', document.getElementById('m' + thisKiller.id))
        // if() {

        //     // inte inträffa om man får ut undefiend
        // }

        count += 1;

        ctx.clearRect(0, 0, 50, 10 * count);

    }
    /* event listeners
    ------------------------------- */

    // listen on close event (server)
    websocket.addEventListener("close", (event) => {
        // console.log('Server down...', event);
        document.getElementById("status").textContent = "Sry....server down";
    });

    // listen to messages from client | server
    websocket.addEventListener("message", (event) => {
        // console.log(event.data);

        let obj = parseJSON(event.data);

        // todo
        // use obj property 'type' to handle message event
        switch (obj.type) {
            case "text":
                renderMessage(obj);
                break;
            case "story":
                // murderStory.innertext = obj.payload
                console.log('obj', obj.payload)
            case "clues":
                // console.log("obj", obj.payload.killerId.clue)
                renderClue(obj.payload.killerId, obj.payload.clue);
                break;
            default:
                break;
        }

        // ...
    });

    setNickname.addEventListener("click", () => {
        // get value from input nickname
        nickname = document.getElementById("nickname").value;

        // if set - disable input nickname
        document.getElementById("nickname").setAttribute("disabled", true);

        // enable input field
        document.getElementById("inputText").removeAttribute("disabled");

        // focus input field
        document.getElementById("inputText").focus();
    });

    inputText.addEventListener("keydown", (event) => {
        // press Enter...make sure at least one char
        if (event.key === "Enter" && inputText.value.length > 0) {
            // chat message object
            let objMessage = {
                msg: inputText.value,
                type: "text",
                nickname: nickname,
            };

            // show new message for this user
            //borde fungera utan renderMessage raden här. fråga servern om man kan skriva ett meddelande. 
            renderMessage(objMessage);

            // send to server
            websocket.send(JSON.stringify(objMessage));

            // reset input field
            inputText.value = "";
        }
    });





    /* functions...
    ------------------------------- */


    /**
     * parse JSON
     *
     * @param {*} data
     * @return {obj}
     */
    function parseJSON(data) {
        // try to parse json
        try {
            let obj = JSON.parse(data);

            return obj;
        } catch (error) {
            // log to file in real application....
            return { error: "An error receving data...expected json format" };
        }
    }

    /**
     * render new message
     *
     * @param {obj}
     */
    function renderMessage(obj) {
        // use template - cloneNode to get a document fragment
        let template = document.getElementById("message").cloneNode(true);

        // access content
        let newMsg = template.content;

        // change content...
        newMsg.querySelector("span").textContent = obj.nickname;
        newMsg.querySelector("p").textContent = obj.msg;

        // new date object
        let objDate = new Date();

        // visual: 10:41 .. 9:5 ... leading zero....
        newMsg.querySelector("time").textContent =
            objDate.getHours() + ":" + objDate.getMinutes();

        // set datetime attribute - see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time
        newMsg
            .querySelector("time")
            .setAttribute("datetime", objDate.toISOString());

        // render using prepend method - last message first
        document.getElementById("conversation").prepend(newMsg);
    }


}

window.onload = Init;


// Saker som inte fungerar och som jag vill ska fungera:

// FRÅGOR RÖRANDE MIN SERVER/CLIENT
// - kan inte längre se mina skickade meddelande mellan chattarna?? - MÅSTE FUNKA - CHECK
// - Får upp dubbelt av mina clues när det är olika webbläsare som trycker på samma clue - CHECK
// - måste göra en if på min renderclue så man inte kan klicka mer än 3 gånger per mördare för få en clue.
// - När man startar om spelet (Laddar om sidan), vill man att en ny historia ska presenteras och att inte servern behövs stängas ner för att göra nytt spel
// - Måste få ut samma mordhistoria på både webbläsarna - MÅSTE FUNKA

// FRÅGOR ANGÅENDE MIN CANVAS:
// - Poäng (canvasen) fortsätter att dra av färg även fast det inte finns fler clues att hämta
// - varför töms min canvas mer på första klicket än på de andra klicken?
// - Få till poäng (siffror) på min rektangel
// - Lösa någon form av game over när stapeln är tömd

// ÖVRIGT
// - Fixa en lösning för  min button "solve this crime" så man kan få ut om man löst mordet eller fått game over
// - Bör jag fixa en typ av inlogg?
// - Hade velat ha en startsida där man skriver in Player 1 och Player 2 som sen ska visas visuellt i chatten. Eller finns det en enklare lösning?
