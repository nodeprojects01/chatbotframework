
const config = require("../../config/config");
const moment = require("moment");
const { log } = require("../../config/logger");


// NLP response event
var responseEvent = {
    query: "hello",
    intent: "business metrics report",
    entities: {
        "ReportType": null,
        "EfileReportTypes": ["us eFile", "canada eFile"],
        "StartDate": null,
        "EndDate": null
    },
    sessionAttributes: {}
}

function formatNlpResponse(nlpResponse) {
    if (!nlpResponse) throw Error("the input object for formatNlpResponse function is invalid");

    const nlpName = global.appSessionMemory.manifests.botModel.nlp.name;
    var formattedNlpResponse = "";
    switch (nlpName) {
        case config.nlpEngines.luis:
            formattedNlpResponse = formatLuisResponse(nlpResponse);
            break;
        case config.nlpEngines.converse:
            formattedNlpResponse = formatConverseResponse(nlpResponse);
            break;
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
    for (const [key, value] of Object.entries(nlpResponse.prediction.entities)) {
        if (key != "$instance") {
            var entArr = [];
            value.forEach(v => {
                entArr.push(v[0]);
            });
            entities[key] = entArr.join("||");
        }
    }
    responseEvent.entities = entities;
    responseEvent.sessionAttributes = nlpResponse.sessionAttributes ? nlpResponse.sessionAttributes : {};
    responseEvent.timeStamp = moment().toISOString();
    log.info(`responseEvent.timeStamp = ${ responseEvent.timeStamp}`)
    return responseEvent;
}

function formatConverseResponse(nlpResponse) {
    if (!nlpResponse) throw Error("the input object for formatLuisResponse function is invalid");

    return responseEvent;
}

module.exports = { formatNlpResponse }