
const RESTcall = require("../../actions/RESTCall");
const config = require("../../config/config");


const luisResponse = {
    "query": "download us efile and canada efile report",
    "prediction": {
        "topIntent": "GenerateReport",
        "intents": {
            "GenerateReport": {
                "score": 0.8503474
            },
            "Greeting": {
                "score": 0.022566138
            },
            "Help": {
                "score": 0.011317778
            },
            "None": {
                "score": 0.011119723
            }
        },
        "entities": {
            "EfileReportTypes": [
                [
                    "canada efile"
                ]
            ],
            "$instance": {
                "EfileReportTypes": [
                    {
                        "type": "EfileReportTypes",
                        "text": "canada efile",
                        "startIndex": 22,
                        "length": 12,
                        "modelTypeId": 5,
                        "modelType": "List Entity Extractor",
                        "recognitionSources": [
                            "model"
                        ]
                    }
                ]
            }
        }
    }
}

async function callLuis(nlpPayload) {
    const rs = new RESTcall({
        url: global.appSessionMemory.manifests.botModel.nlp.url + nlpPayload.query,
        method: global.appSessionMemory.manifests.botModel.nlp.method
    });

    const luisResponse = await rs.execute().then(nlpResp => {
        return nlpResp;
    }).catch(e => {
        throw Error("error while accessing nlp endpoint");
    });

    return luisResponse;
}

module.exports = callLuis;