
// Mina variablar

// Varibel för min chat
const inputText = document.getElementById("inputText");
const setNickname = document.querySelector("#setNickname");

// variable current user | nickname
let nickname;

// Variabel för mina mördare och deras clues
const murderStoryEl = document.getElementById('murderStory');
const killerInfoEl = document.getElementById('killerInfo');

// Variabel för min "Get your story" button
const getYourStoryBtn = document.getElementById('getYourStory');
// Variabel för min "Solve This Crime" button
const solveCrimeBtn = document.getElementById('solveCrimeBtn')

// Min canvas
const canvas = document.getElementById('rectangle');
const ctx = canvas.getContext('2d');

const currentPointsEl = document.getElementById('current-points')

const gameOverSplashId = document.getElementById('splash-gameOver')

// count för ge mina divar för mördarna ett unikt id
let count = 0;

// Min splashscreen för min "Welcome to Crime Time"
let splashScreenStart = document.querySelector('.splash-start');
splashScreenStart.addEventListener('click', () => {
    splashScreenStart.style.opacity = 0;
    setTimeout(() => {
        splashScreenStart.classList.add('hidden')
    }, 610)
})


async function Init() {


    // use WebSocket >>> make sure server uses same ws port!
    const websocket = new WebSocket("ws://localhost:80");


    // fetch för thekillers.json (denna behövs då jag gör en map på killer)
    const response1 = await fetch('thekillers.json')
    const killer = await response1.json()

    // fillstyle och fillrect för min canvas
    ctx.fillStyle = '#333C36';
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // min function för att rendera ut en random murderHistory och en websocket.send för skicka förfrågan till servern om en random story
    function renderStory(murderHistory) {

        murderStoryEl.innerText = murderHistory;

    }
    getYourStoryBtn.addEventListener('click', () => {

        websocket.send(JSON.stringify({ type: "story" }))

    })


    // DENNA MAP FUNKTION MAPPAR UT MINA MÖRDARE PÅ HEMSIDAN


    killer.map((thisKiller) => {

        //CREATE DIV FOR MY KILLERS
        //skapa ett unikt id för varje myKillers, sen nere i renderclue ska jag kalla på id:t för diven
        const myKillers = document.createElement('div');
        myKillers.setAttribute('id', 'm' + count++);


        // CREATE H2 TAG FOR THE NAME OF THE KILLER
        let img = document.createElement('img')
        let h2Name = document.createElement('h2');
        let ptAge = document.createElement('p');
        let buttonClue = document.createElement('button');


        // här får jag fram unika id för mina mördare
        // Murderer visar fyra objekt med ett varsitt id 0-3.

        const murderer = {
            killerId: thisKiller.id
        }

        buttonClue.setAttribute("id", thisKiller.id);

        // im in buttonclue när den klickas på så skickas en förfrågan till servern med mina mördare och deras unika id
        // servern ska skicka tillbaka vem av mördaren jag klickat på och ge mig sista clues i arrayen för den mördaren.
        buttonClue.addEventListener('click', () => {

            websocket.send(JSON.stringify({ type: "clues", payload: murderer }))

        })

        // DECLARE WHAT MY h2Name SHOULD CONTAIN
        img.src = thisKiller.img;
        h2Name.innerText = thisKiller.name;
        ptAge.innerText = thisKiller.age;
        buttonClue.innerText = 'Get clue';

        // WHAT SHOULD MYKILLERS CONTAIN
        myKillers.appendChild(img);
        myKillers.appendChild(h2Name);
        myKillers.appendChild(ptAge)
        myKillers.appendChild(buttonClue);

        // ADD myKillers TO MY BIG DIV killerInfo
        killerInfoEl.appendChild(myKillers);
    })


    // här renderar jag ut min clue för rätt mördare och tömmer samtidigt min canvas för varje gång jag klickat för att få en clue.
    function renderClue(killerId, clue, cluePoint) {

        const clueAndKiller = document.createElement('div');

        clueAndKiller.innerText = clue;

        document.getElementById('m' + killerId).appendChild(clueAndKiller)

        // min uträkning för hur mycket som ska tömmas i min rektangel (canvas), rektangeln är 200 hög, cluepoint är 100p. Gör om till procentenhet
        // för att dra bort rätt mängd från rektangeln. barHeight lägger jag sen in i min clearRect som tömmer, längst bak, som står för heighten på min rektangel

        // cluePoint drar bort 20 varje gång man skickar och frågar servern om en clue.
        const barHeight = 800 - (800 * cluePoint / 100);

        ctx.clearRect(0, 0, barHeight, 30, );
        console.log('cluePoint', cluePoint)

        currentPointsEl.innerText = `Clue Points Left: ${cluePoint}/100p`;
    }

    function renderGameOver() {

        let splashScreenGameOver = document.querySelector('.splash-gameOver');
    splashScreenGameOver.style.opacity = 1;
    setTimeout(() => {
        splashScreenGameOver.classList.add('show')
    }, 610)

    }


    /* event listeners
    ------------------------------- */

    // listen on close event (server)
    websocket.addEventListener("close", (event) => {
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
            case "story": //case för min renderStory, tar emot information från servern. murderHistory är objektet i min json.
                renderStory(obj.payload.murderHistory)
            case "clues": // case för min renderClue där jag även skickar med mina points. i min function skriver jag ut rätt clue på rätt mördare, info som servern gett mig
                if (obj.payload.clue === undefined) {
                    document.getElementById(obj.payload.killerId[0]).disabled = true; // här säger jag att om arrayen är tömd och det kommer undefined så ska knappen bli disabled.
                }
                renderClue(obj.payload.killerId, obj.payload.clue, obj.payload.points);
                break;
            case "gameOver": // case för min gameOver, detta ska renderas ut när min canvas är tömd, när cluePoint är nere på 0 eller om man gissat på fel mördare i min "Solve this Crime"
                renderGameOver()
                break;
            case "solveCrime": // case för min solveCrime button/select. här ska renderas ut på sidan antingen congratulations eller game over
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
            renderMessage(objMessage);

            // send to server
            websocket.send(JSON.stringify(objMessage));

            // reset input field
            inputText.value = "";
        }
    });





    /* functions for my popup-chat
    ------------------------------- */

    document.getElementById("openForm").addEventListener('click', function () {
        document.getElementById("myForm").style.display = "block";
        //validation code to see State field is mandatory.  
    });

    document.getElementById("closeForm").addEventListener('click', function () {
        document.getElementById("myForm").style.display = "none";
        //validation code to see State field is mandatory.  
    });
    // function closeForm() {
    //     document.getElementById("myForm").style.display = "none";
    // }

    // closeForm()
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
        document.getElementById("conversation").append(newMsg);
    }


}

window.onload = Init;


// Saker som inte fungerar och som jag vill ska fungera:

// FRÅGOR RÖRANDE MIN SERVER/CLIENT
// - Vill skapa ett case "Init" så varje gång man starta webbläsaren så ska det skickas en förfrågan direkt till servern, att "hej nu vill jag spela"
// - kan inte längre se mina skickade meddelande mellan chattarna?? - MÅSTE FUNKA - CHECK
// - Får upp dubbelt av mina clues när det är olika webbläsare som trycker på samma clue - CHECK
// - måste göra en if på min renderclue så man inte kan klicka mer än 3 gånger per mördare för få en clue. CHECK
// - När man startar om spelet (Laddar om sidan), vill man att en ny historia ska presenteras och att inte servern behövs stängas ner för att göra nytt spel
// - Måste få ut samma mordhistoria på både webbläsarna - CHECK

// FRÅGOR ANGÅENDE MIN CANVAS:
// - Poäng (canvasen) fortsätter att dra av färg även fast det inte finns fler clues att hämta - CHECK
// - varför töms min canvas mer på första klicket än på de andra klicken? - CHECK
// - Få till poäng (siffror) på min rektangel - PÅBÖRJAD
// - Lösa någon form av game over när stapeln är tömd - PÅBÖRJAD

// ÖVRIGT
// - Fixa en lösning för  min button "solve this crime" så man kan få ut om man löst mordet eller fått game over - SMÅTT PÅBÖRJAD
// - Hade velat ha en startsida där man skriver in Player 1 och Player 2 som sen ska visas visuellt i chatten. (DENNA KOMMER PRIORITERAS BORT)
// - Skriva klart två till mordhistorier
// - Flytta ordningen på mina clues