// DOM elements
const inputText = document.getElementById("inputText");
const setNickname = document.querySelector("#setNickname");

const murderStory = document.getElementById('murderStory');
const killerInfo = document.getElementById('killerInfo');

const canvas = document.getElementById('rectangle');
const ctx = canvas.getContext('2d');

let array = [];

// variable current user | nickname
let nickname;

// my json
let murderhistory;

// count clues and points
let count = 0;

async function Init() {


    // use WebSocket >>> make sure server uses same ws port!
    const websocket = new WebSocket("ws://localhost:80");


    // lägg in en fetch
    const response = await fetch('thekillers.json')
    const killer = await response.json()

    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    console.log('killer', killer);


    fetch('murderhistory.json')
        .then((response) => response.json())
        .then((data) => {
            murderhistory = data;
            console.log('murderhistory', murderhistory);

            function pickRandomStory() {
                // console.log(murderhistory[Math.floor(Math.random()*murderhistory.length)].murderhistory)
                const myStory = document.createElement('div');

                let pTagStory = document.createElement('p');

                pTagStory.innerText = murderhistory[Math.floor(Math.random() * murderhistory.length)].murderhistory;

                myStory.appendChild(pTagStory);

                murderStory.appendChild(myStory);

                return murderhistory[Math.floor(Math.random() * murderhistory.length)].murderhistory;
            }

            pickRandomStory();

        })


    // DENNA MAP FUNKTION MAPPAR UT MINA MÖRDARE PÅ HEMSIDAN


    killer.map((thisKiller) => {

        // denna kan läggas ut globalt när jag löst pop()


        // sen kan jag lägga en global grej för att förändra min rektangel

        //CREATE DIV FOR MY KILLERS
        //skapa ett unikt id för varje myKillers, sen nere i renderclue ska jag kalla på id:t för diven
        const myKillers = document.createElement('div');
        myKillers.setAttribute('id', 'm' + count++);


        // CREATE H2 TAG FOR THE NAME OF THE KILLER
        let h2Name = document.createElement('h2');
        let ptAge = document.createElement('p');
        let buttonClue = document.createElement('button');


        //namnge min prop till något rimligt

        const murder = {
            killerId: thisKiller.id
        }

        console.log('killer', murder)


        buttonClue.addEventListener('click', () => {
            //bara denna raden som ska ändras, det är inget objekt?????????? vad menar han???
            const currentClue = thisKiller.clues.pop();
            console.log('currentclue', currentClue, thisKiller)

            websocket.send(JSON.stringify({ type: "clues", payload: [currentClue, thisKiller] }))


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


    function renderClue(currentClue, thisKiller) {
        //???? VAD GÖR JAG???
        const clueAndKiller = document.createElement('div');

        clueAndKiller.innerText = currentClue;

    document.getElementById('m' + thisKiller.id).appendChild(clueAndKiller)

    console.log('thiskiller id', document.getElementById('m' + thisKiller.id))

    count += 1;

    
    ctx.clearRect(0, 0, 50, 20 * count);



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
            case "clues":
                console.log("obj", obj.killer)

                renderClue(obj.killer[0], obj.killer[1]);
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