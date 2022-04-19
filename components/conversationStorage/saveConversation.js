
require("../../globalVars");
const config = require("../../config/config");
const saveToJsonFile = require("./saveToJsonFile");
const saveToMongoDB = require("./saveToMongoDb");


var database = {};
function saveConversation(responseObject) {
    if (!responseObject){
        throw Error("the input object for saveConversation function is invalid");
    }
    if (responseObject.length == 0){
        throw Error("the input object does not contain message details");
    }
    const nlpResponse = global.appSessionMemory.nlpResponse;
    const getTargetNode = global.appSessionMemory.TargetNode;

    const conversation = {
        id: 1,
        conversationId: nlpResponse.conversationId,
        sessionId: nlpResponse.transactionId,
        transactionId: nlpResponse.transactionId,
        userQuery: nlpResponse.query,
        botResponse: responseObject,
        intent: nlpResponse.intent,
        entities: nlpResponse.entities,
        timeStamp: nlpResponse.timeStamp,
    }

    // store into the database
    // saveToJsonFile(conversation);
    // or
    // saveToMongoDB(conversation);
    // if(database[nlpResponse.conversationId]){
    //     database[nlpResponse.conversationId].push(conversation)
    // }
    // else{
    //     database[nlpResponse.conversationId]=[conversation]
    // }
    
    
    var saveStatus = true;
    switch (config.storage) {
        case config.conversationStorages.jsonFile:
            saveStatus = saveToJsonFile(conversation);
        case config.conversationStorages.mongodb:
            saveStatus = saveToMongoDB(conversation);
    }
    if (!saveStatus) throw Error("error while saving the conversation");
    return saveStatus;
}

module.exports = { saveConversation }