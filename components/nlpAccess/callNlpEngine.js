


function callNLPEngine(nlpPayload) {
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
    // NLP response event
    const event = {
        conversationId: "ax1234bernzzz234499",  // can also be identified as session id
        transactionId: "22344541",
        query: "hello",
        intent: "business metrics report",
        entities: {
            "ReportType": null,
            "EfileType": "Puerto Rico eFile",
            "StartDate": "10-12-2020",
            "EndDate": "11/12/2020"
        },
        sessionAttributes: {}
    }

    return event;
}


module.exports = { callNLPEngine, formatNlpResponse }