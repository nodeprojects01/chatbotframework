

require("../../globalVars");

function translateToUIFormat(responseObject) {
    if(!responseObject) throw Error("the input object for translateToUIFormat function is invalid");

    const chatbotUI = "native";
    var responseToChatbotUI = null;

    switch (chatbotUI){
        case "native":
            responseToChatbotUI = require("./toNativeUI").prepareBotResponse(responseObject);
    }

    return responseToChatbotUI;
}


module.exports = { translateToUIFormat }