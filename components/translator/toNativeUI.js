
const { log } = require("../../config/logger");
const filename = __filename.slice(__dirname.length + 1, -3);


// NLP response event
var botResponseEvent = {
    userId: "",
    convId: "",
    transId: "",
    query: "",
    previousIntentSummary: {},
    askEntity: null,
    botResponse: {},
    sessionAttributes: {}
}

var botResponseMessage = {
    messageType: "",
    message: "",
    followMessage: []
}

function getBotResponseMessage(obj) {
    try {
        return {
            messageType: obj.messageType ? obj.messageType : "PlainText",
            message: obj.message ? obj.message : "",
            options: obj.options ? obj.options : []
        };
    }
    catch {
        log.error(`${filename} > ${arguments.callee.name}: invalid input object`);
        throw new Error("invalid input object");
    }
}

function prepareBotResponse(resp) {
    if (!resp) throw Error("the input object for prepareBotResponse function is invalid");
    if (!("message" in resp)) throw Error("the input object does not contain message details");
    if (resp.message.length === 0) throw Error("the input object does not contain messages")

    var followMessages = [];
    let responseMessage = {...botResponseMessage};
    resp.message.forEach((r, i) => {
        if (i === 0) {
            responseMessage.messageType = r.messageType;
            responseMessage.message = r.message;
        }
        else {
            followMessages.push(getBotResponseMessage(r));
        }
    });
    responseMessage.followMessage = followMessages;
    
    let botResponse = {...botResponseEvent};
    botResponse.userId = global.appSessionMemory.userId;
    botResponse.convId = global.appSessionMemory.conversationId;
    botResponse.transId = global.appSessionMemory.transactionId;
    botResponse.query = global.appSessionMemory.query;
    botResponse.previousIntentSummary = global.appSessionMemory.nlpResponse;
    botResponse.botResponse = responseMessage;

    return botResponse;
}

module.exports = { prepareBotResponse }

