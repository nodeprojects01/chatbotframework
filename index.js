
const config = require("./config/config");
const botModel = require("." + config.botModelPath);
const responseModel = require("." + config.responseModelPath);
const { log } = require("./config/logger");
const searchThroughTree = require("./components/dataRetriever/searchTree");
const ResponseNode = require("./actions/FormatResponse");
const filename = __filename.slice(__dirname.length + 1, -3);


function getEntityValues(entities) {
    var availableEntities = [];
    for (const k of Object.keys(entities)) if (entities[k]) availableEntities.push(entities[k]);
    return availableEntities;
}


async function runProcessSteps(event) {
    try {
        var targetNode = "";
        const rootNode = botModel.intents.filter(o => o.value == event.intent);
        const intentIndex = botModel.intents.findIndex(item => item.value === event.intent);
        if (!rootNode) {
            // return exception message
            // bot model must have invalid values that are not matching the bot's entity values
            log.error(`${filename} > ${arguments.callee.name}: bot model must have invalid intent name that is not matching the bot's intent`);
            return responseModel.messages.default.error;
        }
        else {
            const entities = getEntityValues(event.entities);
            log.info(`${filename} > ${arguments.callee.name}: input event contains ${entities.length} entity values`);

            if (entities.length === 0) {
                // when no entities are available, guide user flow from the root node
                // return message of the first node
                targetNode = rootNode[0];
                return await ResponseNode.reponseFormatter(targetNode).then(res => {
                    log.info(`${filename} > ${arguments.callee.name}: response is successfuly formatted`);
                    log.debug(`${filename} > ${arguments.callee.name}: response - ${JSON.stringify(res)}`);
                    return res;
                }).catch(e => {
                    log.error(`${filename} > ${arguments.callee.name}: error while formatting the response ${e}`);
                    return responseModel.messages.default.error;
                });
            }
            else {
                const targetNode = await searchThroughTree(intentIndex, rootNode, entities);

                if (targetNode.value) {
                    return await ResponseNode.reponseFormatter(targetNode).then(res => {
                        log.info(`${filename} > ${arguments.callee.name}: response is successfuly formatted`);
                        log.debug(`${filename} > ${arguments.callee.name}: response - ${JSON.stringify(res)}`);
                        return res;
                    }).catch(e => {
                        log.error(`${filename} > ${arguments.callee.name}: error while formatting the response ${e}`);
                        return responseModel.messages.default.error;
                    });
                }
                else {
                    // return exception message
                    // bot model must have invalid values that are not matching the bot's entity values
                    log.error(`${filename} > ${arguments.callee.name}: bot model must have invalid values that are not matching the bot's entity values`);
                    return responseModel.messages.default.error;
                }
            }
        }
    }
    catch (e) {
        log.error(`${filename} > ${arguments.callee.name}: something went wrong - ${e}`);
        return e
    }
}

module.exports = runProcessSteps;
