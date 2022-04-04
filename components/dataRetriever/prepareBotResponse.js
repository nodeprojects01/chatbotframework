
const { log } = require("../../config/logger");
const filename = __filename.slice(__dirname.length + 1, -3);

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
    var botResponses = [];
    resp.message.forEach(r => {
        botResponses.push(botResponse(r));
    });
    return botResponses;
}

module.exports = { prepareBotResponse }

