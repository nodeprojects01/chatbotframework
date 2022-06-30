
const config = require("../../config/config");
const { log } = require("../../config/logger");
const SearchTree = require("./Traverse");
const lodash = require('lodash.get');
const filename = __filename.slice(__dirname.length + 1, -3);
require("../../globalVars");


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
    if (!nlpEvent) throw Error("the input object for searchResponseTree function is invalid");
    if (!global.appSessionMemory.manifests.botModel) throw Error("bot model is not valid");
    if (!("intents" in global.appSessionMemory.manifests.botModel)) throw Error("bot model does not contain necessary key values");

    try {
        var targetNode = "";
        const rootNode = global.appSessionMemory.manifests.botModel.intents.filter(o => o.value.toLowerCase() == nlpEvent.intent.toLowerCase());
        const intentIndex = global.appSessionMemory.manifests.botModel.intents.findIndex(item => item.value.toLowerCase() === nlpEvent.intent.toLowerCase());
        if (!rootNode) {
            // return exception message
            // bot model must have invalid values that are not matching the bot's intent name
            log.error(`${filename} > ${arguments.callee.name}: bot model must have invalid intent name that is not matching the bot's intent name`);
            return global.appSessionMemory.manifests.responseModel.messages.default.error;
        }
        else {
            // when no entities are available, guide user flow from the root node
            // return message of the first node
            var availableEntities = Object.values(nlpEvent.entities).filter(v => v != null);
            targetNode = (availableEntities.length === 0) ? rootNode[0] : await searchThroughTree(intentIndex, rootNode, nlpEvent.entities);
            return targetNode;
        }
    }
    catch (e) {
        log.error(`${filename} > ${arguments.callee.name}: something went wrong - ${e}`);
        throw Error(e);
    }
}


function findCommonPath(intentIndex, paths) {
    var pathArr = []
    var options = []
    paths.map(p => pathArr.push(p.split('.')))
    var flag = false
    for (var i = 0; i < pathArr[0].length; i++) {
        for (var j = 1; j < pathArr.length; j++) {
            if (pathArr[0][i] != pathArr[j][i]) {
                flag = true
            }
        }
        if (flag) {
            break
        }
    }
    for (var k = 0; k < pathArr.length; k++) {
        var v = pathArr[k].slice(0, i + 1).join('.');
        if (!options.includes(v)) {
            const strPath = `intents[${intentIndex}]` + v + ".value";
            const targetvalue = lodash(global.appSessionMemory.manifests.botModel, strPath);
            options.push(targetvalue)
        }
    }
    var path = pathArr[0].slice(0, i).join('.');
    return [path, options]

}


async function searchThroughTree(intentIndex, rootNode, entities) {
    try {
        const st = new SearchTree(rootNode[0], entities);
        await st.execute();
        const dotPaths = st.getDotPaths();

        log.info(`${filename} > ${arguments.callee.name}: identified ${dotPaths.length} paths`);
        log.debug(`${filename} > ${arguments.callee.name}: paths - ${dotPaths}`);

        var selectedPath = ""
        var options = []
        if (dotPaths.length === 1) {
            selectedPath = dotPaths[0]
        }
        else if (dotPaths.length >= 2) {
            [selectedPath, options] = findCommonPath(intentIndex, dotPaths);
        }
        else {
            // return exception message
            // bot model must have invalid values that are not matching the bot's entity values
            log.error(`${filename} > ${arguments.callee.name}: bot model must have invalid values that are not matching the bot's entity values`);
            return global.appSessionMemory.manifests.responseModel.messages.default.error;
        }
        var path = await st.checkRequiredNodeinDotPath(rootNode[0], selectedPath.substring(1));
        const strPath = `intents[${intentIndex}]` + path;
        const targetNode = lodash(global.appSessionMemory.manifests.botModel, strPath);
        if (options && options.length > 0) {
            targetNode.values = targetNode.values.filter(v => options.includes(v.value))
        }

        return targetNode;
    }
    catch (e) {
        log.error(`${filename} > ${arguments.callee.name}: something went wrong - ${e}`);
        throw (e);
    }
}


module.exports = { searchResponseTree };
