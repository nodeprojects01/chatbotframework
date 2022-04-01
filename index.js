
const config = require("./config/config");
const { log } = require("./config/logger");
const filename = __filename.slice(__dirname.length + 1, -3);
const { getUserInput } = require("./components/queryReader/getQueryPayload");
const { createNlpPayload } = require("./components/nlpAccess/createNlpPayload");
const { callNLPEngine, formatNlpResponse } = require("./components/nlpAccess/callNLPEngine");
const { searchResponseTree } = require("./components/dataRetriever/searchTree");
const { resolveResponseFormats } = require("./components/dataRetriever/resolveResponseFormats");
const { prepareBotResponse } = require("./components/dataRetriever/prepareBotResponse");
const { saveConversation } = require("./components/conversationStorage/saveConversation");


// getUserInput - get user utterance
// createNlpPayload - format to NLP input template with user input details
// callNLPEngine - call nlp and get event object
// formatNlpResponse - get intent and entities
// searchResponseTree - traverse through response model to get response object
// resolveResponseFormats - get messages object from response model and unzip response formats
// saveConversation - store conversation to database
// translateToUIData - translate response object to chatbot ui format
const steps = {
    getUserInput: "getUserInput",
    createNlpPayload: "createNlpPayload",
    callNLPEngine: "callNLPEngine",
    formatNlpResponse: "formatNlpResponse",
    searchResponseTree: "searchResponseTree",
    resolveResponseFormats: "resolveResponseFormats",
    prepareBotResponse: "prepareBotResponse",
    saveConversation: "saveConversation",
    translateToUIData: "translateToUIData"
}


async function getStep(step, obj) {
    switch (step) {
        case steps.getUserInput: return getUserInput(obj)
        case steps.createNlpPayload: return await createNlpPayload(obj)
        case steps.callNLPEngine: return await callNLPEngine(obj)
        case steps.formatNlpResponse: return await formatNlpResponse(obj)
        case steps.searchResponseTree: return await searchResponseTree(obj)
        case steps.resolveResponseFormats: return await resolveResponseFormats(obj)
        case steps.prepareBotResponse: return await prepareBotResponse(obj)
        case steps.saveConversation: return await saveConversation(obj)
        case steps.translateToUIData: return await translateToUIData(obj)
    }
}


async function executeSteps(userInput) {
    var funInput = userInput;
    for (const step of Object.values(steps)) {
        log.debug(`executing step - ${step}, with input value ${JSON.stringify(funInput)}`);
        funInput = await getStep(step, funInput);
    };
}




module.exports = executeSteps;
