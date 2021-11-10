function AccuracyCalculator(inputData, botData) {
    console.log("inputData", inputData);
    console.log("botData", botData);
    const uniqueInputIntents = [...new Set(inputData.map(item => { return item.expectedIntent.toLowerCase() }))];
    const uniquePredictedIntents = [...new Set(botData.map(item => { return item.actualIntent.toLowerCase() }))];
    let allIntents = [...new Set([...uniqueInputIntents, ...uniquePredictedIntents])];
    allIntents.push(allIntents.splice(allIntents.indexOf("error"), 1)[0]);
    
    const accuracy = allIntents.map(intent => {
        const predictedIntents = botData.filter(item => { return intent === item.predictedIntent }).length;
        const correctlyPredicted = botData.filter(item => { return intent === item.expectedIntent && item.isPass }).length;
        const expectedIntent = inputData.filter(item => { return item.expectedIntent === intent }).length;

        //for confusion matrix
        let missClassified = [];
        const confusionData = allIntents.map(cofIntent => {
            let count = 0;
            if (cofIntent != intent) {
                let confData = botData.filter(item => { return item.expectedIntent === intent && item.predictedIntent === cofIntent });
                count = confData.length;
                if(count != 0)
                {
                    let missUtteraces = confData.map(item => item.utterance);
                    missClassified.push({[cofIntent]: missUtteraces});
                }
            } else {
                count = correctlyPredicted;
            }
            return { [cofIntent]: count }

        });

        return {
            intent: intent,
            predictedIntents: predictedIntents,
            correctlyPredicted: correctlyPredicted,
            expectedIntent: expectedIntent,
            confusionData: confusionData,
            missClassified: missClassified
        }
    })

    const accuracyScores = accuracy.map(item => {
        const recall = item.correctlyPredicted != 0 && item.expectedIntent != 0 ? item.correctlyPredicted / item.expectedIntent : 0;
        const precision = item.correctlyPredicted != 0 && item.predictedIntents != 0 ? item.correctlyPredicted / item.predictedIntents : 0;
        const f1Score = recall != 0 && precision != 0 && (precision + recall) != 0 ? 2 * (precision * recall) / (precision + recall) : 0;

        return {
            ...item,
            recall: (recall * 100).toFixed(2),
            precision: (precision * 100).toFixed(2),
            f1Score: (f1Score * 100).toFixed(2)
        }
    })

    let botAccuracy = accuracyScores.map(item => { return item.correctlyPredicted }).reduce(function (acc, val) { return acc + val; }, 0)
    let total = inputData.length;
    return {
        botAccuracy: { accuracy: (botAccuracy / total * 100).toFixed(2), total: total },
        accuracyScores: accuracyScores,
        rawData: botData
    };

}

module.exports = { AccuracyCalculator }