console.log("hello from peerA");

const localConnection = new RTCPeerConnection();
const offerTextArea = document.getElementById("offer-txt-area");
const answerTextArea = document.getElementById("answer-txt-area");
const submitAnswerBtn = document.getElementById("submit-answer-btn");

const msgInputForm = document.getElementById("msg-input-form");
const sendMsgInput = document.getElementById("msg-input-txt");
const chatBox = document.getElementById("chat-box");

localConnection.onicecandidate = e => {
    console.log("New ice candidate !! on localConnection reprinting SDP");
    let offer = JSON.stringify(localConnection.localDescription);
    console.log(offer);
    offerTextArea.innerText = offer;
};

const sendChannel = localConnection.createDataChannel("sendChannel");
sendChannel.onmessage = e => {
    console.log("Message received!!!" + e.data);
    showMessageInTextBox(e.data);
};
sendChannel.onopen = e => {
    showMessageInTextBox("Connection opened with peerB", { isAnAlert: true });
    console.log("open!");
};
sendChannel.onclose = e => {
    showMessageInTextBox("Connection closed with peerB", { isAnAlert: true });
    console.log("closed!");
};

localConnection.createOffer().then(offer => {
    localConnection.setLocalDescription(offer);
});

const setAnswer = async (answer) => {
    await localConnection.setRemoteDescription(answer);
    console.log("Done...");
};

submitAnswerBtn.onclick = () => {
    let answerObj = JSON.parse(answerTextArea.value);
    setAnswer(answerObj);
};

msgInputForm.onsubmit = (e) => {
    e.preventDefault();
    if (sendChannel && sendMsgInput.value) {
        sendChannel.send(sendMsgInput.value);
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