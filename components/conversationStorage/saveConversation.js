
require("../../globalVars");

function saveConversation(responseObject) {
    if (!responseObject){
        throw Error("the input object for saveConversation function is invalid");
    }
    if (responseObject.length == 0){
        throw Error("the input object does not contain message details");
    }

    const getTargetNode = global.appSessionMemory.targetNode;

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

    var saveStatus = true;
    if (!saveStatus) throw Error("error while saving the conversation");
    return saveStatus;
}

module.exports = { saveConversation }