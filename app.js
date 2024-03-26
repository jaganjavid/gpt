

const openAiAPI = "";
const inputMsg = document.querySelector("#userText");
const content = document.querySelector("#content");
const sendButton = document.querySelector("#sendButton");
const newChatButton = document.querySelector("#newChatButton");
const mainContent = document.querySelector(".display-content");

// Function to save chat messages to local storage
const saveMessagesToLocalStorage = (messages) => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
}

// Function to retrieve chat messages from local storage
const getMessagesFromLocalStorage = () => {
    const messages = localStorage.getItem("chatMessages");

    return messages ? JSON.parse(messages) : [];

}

// Load previous chat messages from local storage
const loadChatFromLocalStorage = () => {
    const messages = getMessagesFromLocalStorage();
    messages.forEach(({ role, content }) => {
        addMessage(role, content);
    });
}

const sendMessage = async (message) => {
    addMessage("user", message);
    showLoader();

    let url = "https://api.openai.com/v1/chat/completions";
    let token = `Bearer ${openAiAPI}`;
    let model = 'gpt-3.5-turbo';

    let messagesToSend = [
        {
            role: 'user',
            content: message
        }
    ];

    try {
        let res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: messagesToSend
            })
        });

        let resjson = await res.json();

        addMessage("bot", resjson.choices[0].message.content);

        // Save the chat message to local storage
        saveMessagesToLocalStorage([
            ...getMessagesFromLocalStorage(),
            { role: "user", content: message },
            { role: "bot", content: resjson.choices[0].message.content }
        ]);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        hideLoader();
    }
}

const addMessage = (role, message) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role + '-message');
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('message-bubble', role + '-bubble');
    messageBubble.textContent = message;
    messageDiv.appendChild(messageBubble);
    content.appendChild(messageDiv);
    content.scrollTop = content.scrollHeight; // Scroll to bottom
}

const showLoader = () => {
    const loaderDiv = document.createElement('div');
    loaderDiv.classList.add('message', 'bot-message', 'loader');
    const loaderBubble = document.createElement('div');
    loaderBubble.classList.add('message-bubble', 'bot-bubble');
    loaderBubble.textContent = "Loading...";
    loaderDiv.appendChild(loaderBubble);
    content.appendChild(loaderDiv);
    content.scrollTop = content.scrollHeight; // Scroll to bottom
}

const hideLoader = () => {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
}

newChatButton.addEventListener("click", function(){
    localStorage.clear();
    location.reload();
})

sendButton.addEventListener("click", function(e){
    e.preventDefault();
    const message = inputMsg.value.trim();
    if (message !== "") {
        sendMessage(message);
        inputMsg.value = ""; // Clear input field after sending
    }
})

// Load previous chat messages when the page loads
window.addEventListener("load", loadChatFromLocalStorage);