

require("../../globalVars");

function translateToUIData(data) {
    if(!("targetNode" in global.appSessionMemory)) throw Error("the global variables does not contain target node");

    const targetNode = global.appSessionMemory.targetNode;
    const chatbotUiFormat = targetNode.message;

    return chatbotUiFormat;
}


module.exports = { translateToUIData }