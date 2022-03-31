
const { log } = require("../../config/logger");
const filename = __filename.slice(__dirname.length + 1, -3);

function botResponse(obj) {
    try {
        console.log(JSON.stringify(obj));
        return {
            messageType: obj.messageType ? obj.messageType : messageTypes.plainText,
            message: obj.message ? obj.message : "",
            options: obj.options ? obj.options : []
        };
    }
    catch {
        log.error(`${filename} > ${arguments.callee.name}: invalid input object`);
        throw new Error("invalid input object");
    }
}

function prepareBotResponse (resp) { 
    return botResponse(resp); 
}

module.exports = { prepareBotResponse }

