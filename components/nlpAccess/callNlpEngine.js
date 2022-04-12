
const { log } = require("../../config/logger");
const config = require("../../config/config");
const filename = __filename.slice(__dirname.length + 1, -3);
const callLuis = require("./callLuis");
require("../../globalVars");

const nlpEngine = {
    luis: "LUIS",
    converse: "CONVERSE",
    lex: "LEX"
}


async function callNLPEngine(nlpPayload) {
    if (!nlpPayload) throw Error("the input object for callNlpEngine function is invalid");
    if (!("query" in nlpPayload)) throw Error("user query is not found in nlpPayload");
    if (!nlpPayload.query) throw Error("nlp payload must contain user query");

    var nlpResponse = {};
    // call NLP API here
    const nlpName = config.nlp.name;
    switch (nlpName) {
        case config.nlpEngine.luis:
            return await callLuis(nlpPayload);
        case config.nlpEngine.converse:
            return await callConverse(nlpPayload);
    }

    nlpResponse = {
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


module.exports = { callNLPEngine }