
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
                    "us efile"
                ],
                [
                    "canada efile"
                ]
            ],
            "$instance": {
                "EfileReportTypes": [
                    {
                        "type": "EfileReportTypes",
                        "text": "us efile",
                        "startIndex": 9,
                        "length": 8,
                        "modelTypeId": 5,
                        "modelType": "List Entity Extractor",
                        "recognitionSources": [
                            "model"
                        ]
                    },
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

function callLuis(nlpPayload) {
    const rs = new RESTcall({
        url: config.nlp.url + nlpPayload.query,
        method: config.nlp.method
    });

    rs.execute().then(res => {

    }).catch(e => {

    });
}

module.exports = callLuis;