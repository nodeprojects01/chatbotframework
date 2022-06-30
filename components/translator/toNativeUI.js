
const { log } = require("../../config/logger");
const filename = __filename.slice(__dirname.length + 1, -3);


// NLP response event
var botResponseEvent = {
    userId: "testId",
    convId: "",
    transId: "",
    query: "hello",
    nlpResponse: {}
}

var botTitleMessage = {
    messageType: "",
    message: "",
    followMessage: []
}

function botResponse(obj) {
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
    resp.message.forEach((r, i) => {
        if (i === 0) {
            botTitleMessage.messageType = r.messageType;
            botTitleMessage.message = r.message;
        }
        else {
            followMessages.push(botResponse(r));
        }
    });

    botTitleMessage.followMessage = followMessages;
    
    botResponseEvent = {...botResponseEvent};
    botResponseEvent.userId = global.appSessionMemory.userId;
    botResponseEvent.convId = global.appSessionMemory.conversationId;
    botResponseEvent.transId = global.appSessionMemory.transactionId;
    botResponseEvent.query = global.appSessionMemory.query;
    botResponseEvent.nlpResponse = global.appSessionMemory.nlpResponse;
    botResponseEvent.botResponse = botTitleMessage

    return botResponseEvent;
}

module.exports = { prepareBotResponse }

