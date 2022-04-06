
const { log } = require("../../config/logger");
const filename = __filename.slice(__dirname.length + 1, -3);
require("../../globalVars");

function callNLPEngine(nlpPayload) {
    if (!nlpPayload) throw Error("the input object for callNlpEngine function is invalid");
    if (!("query" in nlpPayload)) throw Error("user query is not found in nlpPayload");
    if (!nlpPayload.query) throw Error("nlp payload must contain user query");

    if (nlpPayload.query) {
        // call NLP API here
        const nlpResponse = {
            query: nlpPayload.query,
            intent: "business metrics report",
            entities: {
                "ReportType": null,
                "EfileType": "Puerto Rico eFile",
                "StartDate": null,
                "EndDate": "25-03-2022"
            },
            sessionAttributes: {}
        };

        return nlpResponse;
    }
    else {
        // NLP api input cannot be empty
        console.log("empty input");
    }
}

function formatNlpResponse(nlpResponse) {
    if(!nlpResponse) throw Error("the input object for formatNlpResponse function is invalid");
    // NLP response event
    const event = {
        conversationId: "ax1234bernzzz234499",  // can also be identified as session id
        transactionId: "22344541",
        query: "hello",
        intent: "business metrics report",
        entities: {
            "ReportType": null,
            "EfileType": "H&W eFile",
            "StartDate": null,
            "EndDate": null
        },
        sessionAttributes: {}
    }

    global.appSessionMemory.nlpResponse = event;
    return event;
}


module.exports = { callNLPEngine, formatNlpResponse }