
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
            var availableEntities = [];
            for (const k of Object.keys(nlpEvent.entities))
                if (nlpEvent.entities[k]) availableEntities.push(nlpEvent.entities[k]);

            log.info(`${filename} > ${arguments.callee.name}: input nlpEvent contains ${availableEntities.length} entity values`);

            // when no entities are available, guide user flow from the root node
            // return message of the first node
            targetNode = (availableEntities.length === 0) ? rootNode[0] : await searchThroughTree(intentIndex, rootNode, availableEntities);
            return targetNode;
        }
    }
    catch (e) {
        log.error(`${filename} > ${arguments.callee.name}: something went wrong - ${e}`);
        return e
    }
}

async function searchThroughTree(intentIndex, rootNode, entities) {
    try {
        const st = new SearchTree(rootNode[0]);
        await st.execute(entities);
        const dotPaths = st.getDotPaths();
        log.info(`${filename} > ${arguments.callee.name}: identified ${dotPaths.length} paths`);
        log.debug(`${filename} > ${arguments.callee.name}: paths - ${dotPaths}`);

        if (dotPaths.length === 1) {
            // if it not a leaf node (or response type is close) then return the message 
            // else ask for next entity options
            const strPath = `intents[${intentIndex}]` + dotPaths[0];
            const targetNode = lodash(botModel, strPath);
            return targetNode;
        }
        else if (dotPaths.length >= 2) {
            // return generic message for confirmation
            var targetNode = "";
            const vp = st.getValuePaths();

            vp[0].some((v, i) => {
                if (v != vp[1][i]) {
                    const strPath = `intents[${intentIndex}]` + dotPaths[0];
                    var ii = nth_occurrence(strPath, '.', i);
                    targetNode = lodash(botModel, strPath.substr(0, ii));
                    // console.log(targetNode.value);
                    return true;
                }
            });

            return targetNode;
        }
        else {
            // return exception message
            // bot model must have invalid values that are not matching the bot's entity values
            log.error(`${filename} > ${arguments.callee.name}: bot model must have invalid values that are not matching the bot's entity values`);
            return responseModel.messages.default.error;
        }
    }
    catch (e) {
        log.error(`${filename} > ${arguments.callee.name}: something went wrong - ${e}`);
        return e
    }
}

module.exports = { searchResponseTree };
