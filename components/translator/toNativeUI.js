
const { log } = require("../../config/logger");
const filename = __filename.slice(__dirname.length + 1, -3);

var botTitleMessage = {
    messageType: "",
    message: "",
    followText: []
}

function botResponse(obj) {
    try {
        console.log(JSON.stringify(obj));
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

    var followTexts = [];
    resp.message.forEach((r, i) => {
        if (i === 0) {
            botTitleMessage.messageType = r.messageType;
            botTitleMessage.message = r.message;
        }
        else {
            followTexts.push(botResponse(r));
        }
    });

    botTitleMessage.followText = followTexts;
    console.log("final resp to ui >>>> ", botTitleMessage);
    return botTitleMessage;
}

module.exports = { prepareBotResponse }

