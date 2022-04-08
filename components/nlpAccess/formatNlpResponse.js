


function formatNlpResponse(nlpResponse) {
    if (!nlpResponse) throw Error("the input object for formatNlpResponse function is invalid");
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


module.exports = { formatNlpResponse }