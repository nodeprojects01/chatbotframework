
const config = require("../../config/config");
const botModel = require("../.." + config.botModelPath);
const responseModel = require("../.." + config.responseModelPath);
const { log } = require("../../config/logger");
const SearchTree = require("./Traverse");
const lodash = require('lodash.get');
const filename = __filename.slice(__dirname.length + 1, -3);


function nth_occurrence(string, char, nth) {
    var first_index = string.indexOf(char);
    var lfi = first_index + 1;

    if (nth == 1) {
        return first_index;
    } else {
        var afo = string.slice(lfi);
        var next_occurrence = nth_occurrence(afo, char, nth - 1);

        if (next_occurrence === -1) {
            return -1;
        } else {
            return lfi + next_occurrence;
        }
    }
}

function isRequired(isReqPaths, dotPaths) {
    var ind = isReqPaths.indexOf('1')
    if (ind > -1) {
        var newdotPath = '';
        dotPaths.split('.').map((d, i) => {
            if (ind > i && i != 0) {
                newdotPath = newdotPath + '.' + d
            }
        }
        )
        return newdotPath;

    }
    else {
        return dotPaths;
    }
}

/**
 * The function traverse through response model to get response object
 * @param {*} nlpEvent 
 * @returns 
 */
async function searchResponseTree(nlpEvent) {
    try {
        var targetNode = "";
        const rootNode = botModel.intents.filter(o => o.value == nlpEvent.intent);
        const intentIndex = botModel.intents.findIndex(item => item.value === nlpEvent.intent);
        if (!rootNode) {
            // return exception message
            // bot model must have invalid values that are not matching the bot's entity values
            log.error(`${filename} > ${arguments.callee.name}: bot model must have invalid intent name that is not matching the bot's intent name`);
            return responseModel.messages.default.error;
        }
        else {
            // when no entities are available, guide user flow from the root node
            // return message of the first node
            var availableEntities = Object.values(nlpEvent.entities).filter(v=>v!=null);
            console.log(availableEntities)
            targetNode = (availableEntities.length === 0) ? rootNode[0] : await searchThroughTree(intentIndex, rootNode, nlpEvent.entities);
            return { nlpEvent, targetNode };
        }
    }
    catch (e) {
        log.error(`${filename} > ${arguments.callee.name}: something went wrong - ${e}`);
        return e
    }
}
function findCommonPath(paths){
    var n = paths.length
    var s = arr[0];
    var len = s.length();
    var res = "";
    for (var i = 0; i < len; i++) {
        for (var j = i + 1; j <= len; j++) {

            // generating all possible substrings
            // of our reference string arr[0] i.e s
            var stem = s.substring(i, j);
            var k = 1;
            for (k = 1; k < n; k++)

                // Check if the generated stem is
                // common to all words
                if (!arr[k].contains(stem))
                    break;

            // If current substring is present in
            // all strings and its length is greater
            // than current result
            if (k == n && res.length() < stem.length())
                res = stem;
        }
    }
    return res;
}
async function searchThroughTree(intentIndex, rootNode, entities) {
    try {
        const st = new SearchTree(rootNode[0], entities);
        await st.execute();
        const dotPaths = st.getDotPaths();

        log.info(`${filename} > ${arguments.callee.name}: identified ${dotPaths.length} paths`);
        log.debug(`${filename} > ${arguments.callee.name}: paths - ${dotPaths}`);

        var selectedPath=""
        if (dotPaths.length === 1) {
            selectedPath = dotPaths[0]
        }
        else if (dotPaths.length >= 2) {
            selectedPath = findCommonPath(dotPaths);
        }
        else {
            // return exception message
            // bot model must have invalid values that are not matching the bot's entity values
            log.error(`${filename} > ${arguments.callee.name}: bot model must have invalid values that are not matching the bot's entity values`);
            return responseModel.messages.default.error;
        }

        // st.checkRequiredNodeinDotPath(selectedPath)
        // const path = st.getDotPaths();

        const strPath = `intents[${intentIndex}]` +  dotPaths[0];
        const targetNode = lodash(botModel, strPath);
        return targetNode;
    }
    catch (e) {
        log.error(`${filename} > ${arguments.callee.name}: something went wrong - ${e}`);
        return e
    }
}

module.exports = { searchResponseTree };
