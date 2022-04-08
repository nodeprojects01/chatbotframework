const config = {
    appName: "BotFramework",
    botModelPath: "/manifest/eFile/botModel.json",
    responseModelPath: "/manifest/eFile/responseModel.json",
    nlp: {
        name: "luis",
        url: "https://australiaeast.api.cognitive.microsoft.com/luis/prediction/v3.0/apps/e2728698-7170-4eb8-802e-8971e6104e1c/slots/production/predict?verbose=true&show-all-intents=true&log=true&subscription-key=9ee3b98f0d1041ac89a9a03dd30adbcc&query=",
        method: "GET"
    }
}

module.exports = config