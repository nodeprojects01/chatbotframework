const config = {
    appName: "BOT_FRAMEWORK",
    botModelPath: "/manifest/botModel.json",
    responseModelPath: "/manifest/responseModel.json",
    nlpEngines: {
        luis: "LUIS",
        converse: "CONVERSE",
        lex: "LEX"
    },
    conversationStorages: {
        jsonFile: "JSON_FILE",
        mongodb: "MONGODB_DATABASE"
    },
    messageTypes: {
        plainText: "PlainText",
        quickReplies: "QuickReplies",
        date: "Date",
        hyperLink: "HyperLink",
        multiLine: "MultiLine",
        carousel: "Carousel",
        plainTextByApi: "PlainTextByApi",
        plainTextByEntities: "PlainTextByEntities"
    }
}

module.exports = config