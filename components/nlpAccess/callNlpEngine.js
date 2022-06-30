
const { log } = require("../../config/logger");
const config = require("../../config/config");
const filename = __filename.slice(__dirname.length + 1, -3);
const callLuis = require("./callLuis");
require("../../globalVars");


async function callNLPEngine(nlpPayload) {
    if (!nlpPayload) throw Error("the input object for callNlpEngine function is invalid");
    if (!("query" in nlpPayload)) throw Error("user query is not found in nlpPayload");
    if (!nlpPayload.query) throw Error("nlp payload must contain user query");

    // call NLP API here
    const nlpName = global.appSessionMemory.manifests.botModel.nlp.name;
    switch (nlpName) {
        case config.nlpEngines.luis:
            return await callLuis(nlpPayload);
        case config.nlpEngines.converse:
            return await callConverse(nlpPayload);
    }

}


module.exports = { callNLPEngine }