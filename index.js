
const config = require("./config/config");
const { log } = require("./config/logger");
const filename = __filename.slice(__dirname.length + 1, -3);
const { getUserInput } = require("./components/queryReader/getQueryPayload");
const { createNlpPayload } = require("./components/nlpAccess/createNlpPayload");
const { callNLPEngine } = require("./components/nlpAccess/callNLPEngine");
const { formatNlpResponse } = require("./components/nlpAccess/formatNlpResponse");
const { searchResponseTree } = require("./components/dataRetriever/searchTree");
const { resolveResponseFormats } = require("./components/dataRetriever/resolveResponseFormats");
const { saveConversation } = require("./components/conversationStorage/saveConversation");
const { translateToUIFormat } = require("./components/translator/translateToUIFormat");


async function getStep(step, obj) {
    switch (step) {
        case steps.getUserInput: return getUserInput(obj)
        case steps.createNlpPayload: return await createNlpPayload(obj)
        case steps.callNLPEngine: return await callNLPEngine(obj)
        case steps.formatNlpResponse: return await formatNlpResponse(obj)
        case steps.searchResponseTree: return await searchResponseTree(obj)
        case steps.resolveResponseFormats: return await resolveResponseFormats(obj)
        case steps.translateToUIFormat: return await translateToUIFormat(obj)
        case steps.saveConversation: return await saveConversation(obj)
    }
}

// initialize - load app configs and chatbot manifest files
// getUserInput - get user utterance
// createNlpPayload - format to NLP input template with user input details
// callNLPEngine - call nlp and get event object
// formatNlpResponse - get intent and entities
// searchResponseTree - traverse through response model to get response object
// resolveResponseFormats - get messages object from response model and unzip response formats
// saveConversation - store conversation to database
// translateToUIFormat - translate response object to chatbot ui format
const steps = {
    getUserInput: "getUserInput",
    createNlpPayload: "createNlpPayload",
    callNLPEngine: "callNLPEngine",
    formatNlpResponse: "formatNlpResponse",
    searchResponseTree: "searchResponseTree",
    resolveResponseFormats: "resolveResponseFormats",
    translateToUIFormat: "translateToUIFormat",
    saveConversation: "saveConversation"
}

async function executeSteps(userInput) {
    var finalOutput = userInput;
    for (const step of Object.values(steps)) {
        log.debug(`${filename} > executing step - [ ${step} ]`);
        finalOutput = await getStep(step, finalOutput);
    };

    return global.appSessionMemory.responseToChatbotUI;
}




module.exports = executeSteps;
