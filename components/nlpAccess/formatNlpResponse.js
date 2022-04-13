
const config = require("../../config/config");
const moment = require("moment");

// NLP response event
var responseEvent = {
    conversationId: "ax1234bernzzz234499",  // can also be identified as session id
    transactionId: "22344541",
    query: "hello",
    intent: "business metrics report",
    entities: {
        "ReportType": null,
        "EfileReportTypes": "H&W eFile",
        "StartDate": null,
        "EndDate": null
    },
    sessionAttributes: {}
}

function formatNlpResponse(nlpResponse) {
    if (!nlpResponse) throw Error("the input object for formatNlpResponse function is invalid");

    const nlpName = config.nlp.name;
    var formattedNlpResponse = "";
    switch (nlpName) {
        case config.nlpEngine.luis:
            formattedNlpResponse = formatLuisResponse(nlpResponse);
        case config.nlpEngine.converse:
            formattedNlpResponse = formatConverseResponse(nlpResponse);
    }

    global.appSessionMemory.nlpResponse = formattedNlpResponse;
    return formattedNlpResponse;
}

function formatLuisResponse(nlpResponse) {
    if (!nlpResponse) throw Error("the input object for formatLuisResponse function is invalid");
    if (!nlpResponse.query) throw Error("the luis response doesn't contain query parameter");
    if (!nlpResponse.prediction.topIntent) throw Error("the luis response doesn't contain intent parameter");
    if (!nlpResponse.prediction.entities) throw Error("the luis response doesn't contain entities parameter");

    responseEvent.query = nlpResponse.query;
    responseEvent.intent = nlpResponse.prediction.topIntent;
    var entities = {}
    for (const [key, value] of Object.entries(nlpResponse.prediction.entities["$instance"])) {
        entities[key] = value[0].text;
    }
    responseEvent.entities = entities;
    responseEvent.sessionAttributes = nlpResponse.sessionAttributes ? nlpResponse.sessionAttributes : {};
    responseEvent.timeStamp = moment().toISOString();
    return responseEvent;
}

function formatConverseResponse(nlpResponse) {
    if (!nlpResponse) throw Error("the input object for formatLuisResponse function is invalid");

    return responseEvent;
}

module.exports = { formatNlpResponse }