console.log("hello from peerB");
const remoteConnection = new RTCPeerConnection();
const offerTextArea = document.getElementById("offer-txt-area");
const answerTextArea = document.getElementById("answer-txt-area");
const submitOfferBtn = document.getElementById("submit-offer-btn");
const msgInputForm = document.getElementById("msg-input-form");
const sendMsgInput = document.getElementById("msg-input-txt");

const chatBox = document.getElementById("chat-box");

// showMessageInTextBox("hello there", { isAnAlert: true });
// showMessageInTextBox("hello there", { isSentByMe: true });
// showMessageInTextBox("hello there");

remoteConnection.onicecandidate = e => {
    console.log("NEW ice candidate!! on remoteConnection reprinting SDP");
    console.log(JSON.stringify(remoteConnection.localDescription));
};

remoteConnection.ondatachannel = e => {
    const receiveChannel = e.channel;
    receiveChannel.onmessage = e => {
        console.log("Message received!!!" + e.data);
        showMessageInTextBox(e.data);
    };
    receiveChannel.onopen = e => {
        showMessageInTextBox("Connection opened with peerA", { isAnAlert: true });
        console.log("open!");
    };
    receiveChannel.onclose = e => {
        showMessageInTextBox("Connection closed with peerA", { isAnAlert: true });
        console.log("closed!");
    };
    remoteConnection.channel = receiveChannel;
};

const setOffer = async (offer) => {
    await remoteConnection.setRemoteDescription(offer);
    console.log("Done");


    // create answer 
    await remoteConnection.createAnswer().then(a => {
        remoteConnection.setLocalDescription(a).then(a => {
            let answer = JSON.stringify(remoteConnection.localDescription);
            console.log(answer);
            answerTextArea.innerText = answer;
        });
    });
};

submitOfferBtn.onclick = () => {
    const offerObj = JSON.parse(offerTextArea.value);
    setOffer(offerObj);
};

msgInputForm.onsubmit = (e) => {
    e.preventDefault();
    if (remoteConnection.channel && sendMsgInput.value) {
        remoteConnection.channel.send(sendMsgInput.value);
        showMessageInTextBox(sendMsgInput.value, { isSentByMe: true });
        sendMsgInput.value = "";
    }
};

function showMessageInTextBox(msg, options) {
    let isSentByMe = false;
    let isAlert = false;
    if (options) {
        if (options.isSentByMe) {
            isSentByMe = options.isSentByMe;
        }
        if (options.isAnAlert) {
            isAlert = options.isAnAlert;
        }
    }

    if (!isAlert) {
        const messageContainer = document.createElement("div");
        messageContainer.className = "chat-message-container";
        if (isSentByMe) messageContainer.className = messageContainer.className + " " + "message-sent-by-me";

        const messageElement = document.createElement('div');
        messageElement.className = "chat-message-element";
        messageElement.innerText = msg;


        messageContainer.appendChild(messageElement);
        chatBox.appendChild(messageContainer);
    } else {
        const alertContainer = document.createElement("alert-container");
        alertContainer.className = "chat-message-container msg-alert";
        const alertElement = document.createElement("div");

        alertElement.innerText = msg;

        alertContainer.appendChild(alertElement);
        chatBox.appendChild(alertContainer);
    }
}