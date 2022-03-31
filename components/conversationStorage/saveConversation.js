

function saveConversation(getQueryPayload, responseObject) {
    const conversation = {
        id: 1,
        conversationId: "",
        sessionId: "",
        userQuery: "",
        botResponse: ""
    }

    // store into the database
    // saveToJsonFile(conversation);
    // or
    // saveToMongoDB(conversation);
}

module.exports = { saveConversation }