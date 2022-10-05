// DOM elements
const inputText = document.getElementById("inputText");
const setNickname = document.querySelector("#setNickname");


// variable current user | nickname
let nickname;


// use WebSocket >>> make sure server uses same ws port!
const websocket = new WebSocket("ws://localhost:80");  




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