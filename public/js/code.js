// DOM elements
const inputText = document.getElementById("inputText");
const setNickname = document.querySelector("#setNickname");

const murderStory = document.getElementById('murderStory');
const killerInfo = document.getElementById('killerInfo');


// variable current user | nickname
let nickname;

// my json
let killer;
let murderhistory;

// use WebSocket >>> make sure server uses same ws port!
const websocket = new WebSocket("ws://localhost:80");  

// lägg in en fetch
fetch('thekillers.json')
.then((response) => response.json())
.then((data) => {

    killer = data;
    console.log('killer', killer);

    killer.map((thisKiller) => {

        console.log(thisKiller);
    
        //CREATE DIV FOR MY KILLERS
        const myKillers = document.createElement('div');
    
        // CREATE H2 TAG FOR THE NAME OF THE KILLER
        let h2Name = document.createElement('h2');
    
        // DECLARE WHAT MY h2Name SHOULD CONTAIN
        h2Name.innerText = thisKiller.name;
    
        // WHAT SHOULD MYKILLERS CONTAIN
        myKillers.appendChild(h2Name);
    
        // ADD myKillers TO MY BIG DIV killerInfo
        killerInfo.appendChild(myKillers);
    
    })
})

fetch('murderhistory.json')
.then((response) => response.json())
.then ((data) => {
    murderhistory = data;
    console.log('murderhistory',  murderhistory);

    // murderhistory.map((thisStory) => {
    //     console.log("thisStory", thisStory)

    //     const myStory = document.createElement('div');

    //     let pTagStory = document.createElement('p');

    //     pTagStory.innerText = thisStory.murderhistory;
    //     myStory.appendChild(pTagStory);
    //     murderStory.appendChild(myStory);
    // }) 


    function pickRandomStory() {
        // console.log(murderhistory[Math.floor(Math.random()*murderhistory.length)].murderhistory)
        const myStory = document.createElement('div');

        let pTagStory = document.createElement('p');

        pTagStory.innerText = murderhistory[Math.floor(Math.random()*murderhistory.length)].murderhistory;

        myStory.appendChild(pTagStory);

        murderStory.appendChild(myStory);

        return murderhistory[Math.floor(Math.random()*murderhistory.length)].murderhistory;
}

pickRandomStory();

})

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
            break;
        case "somethingelse":
            break;
        default:
            break;
    }

    // ...
    renderMessage(obj);
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