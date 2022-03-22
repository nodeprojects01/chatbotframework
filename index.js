
const config = require("./config/config");
const botModel = require("." + config.botModelPath);
const responseModel = require("." + config.responseModelPath);
const { log } = require("./config/logger");
const SearchTree = require("./actions/Traverse");
const ResponseNode = require("./actions/FormatResponse");
const lodash = require('lodash.get');
const filename = __filename.slice(__dirname.length + 1, -3);


function getEntityValues(entities) {
    var availableEntities = [];
    for (const k of Object.keys(entities)) if (entities[k]) availableEntities.push(entities[k]);
    return availableEntities;
}

function getPathsOfValue(obj, value) {
    return Object
        .keys(obj)
        .reduce((r, k) => {
            var kk = Array.isArray(obj) ? `${k}` : `${k}`;
            if (obj[k] === value) {
                r.push(kk);
            }
            if (obj[k] && typeof obj[k] === 'object') {
                r.push(...getPathsOfValue(obj[k], value).map(p => kk + (p[0] === '[' ? '' : '.') + p));
            }
            return r;
        }, []);
}

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

async function runProcessSteps(event) {
    try {
        var targetNode = "";
        const rootNode = botModel.intents.filter(o => o.value == event.intent);
        if (rootNode) {
            const entities = getEntityValues(event.entities);
            log.info(`${filename} > ${arguments.callee.name}: input event contains ${entities.length} entity values`);
            if (entities.length >= 1) {
                const st = new SearchTree(rootNode[0]);
                await st.execute(entities);
                const dotPaths = st.getDotPaths();
                log.info(`${filename} > ${arguments.callee.name}: identified ${dotPaths.length} paths`);
                log.debug(`${filename} > ${arguments.callee.name}: paths - ${dotPaths}`);

                const intentIndex = botModel.intents.findIndex(item => item.value === event.intent);
                if (dotPaths.length >= 2) {
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

                    return await ResponseNode.reponseFormatter(targetNode).then(res => {
                        log.info(`${filename} > ${arguments.callee.name}: response is successfuly formatted`);
                        log.debug(`${filename} > ${arguments.callee.name}: response - ${JSON.stringify(res)}`);
                        return res;
                    }).catch(e => {
                        log.error(`${filename} > ${arguments.callee.name}: error while formatting the response ${e}`);
                        return responseModel.messages.default.error;
                    });
                }
                else if (dotPaths.length == 1) {
                    // if it not a leaf node (or response type is close) then return the message 
                    // else ask for next entity options
                    const strPath = `intents[${intentIndex}]` + dotPaths[0];
                    const targetNode = lodash(botModel, strPath);
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
            else {
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
        }
        else {
            // return exception message
            // bot model must have invalid values that are not matching the bot's entity values
            log.error(`${filename} > ${arguments.callee.name}: bot model must have invalid intent name that is not matching the bot's intent`);
            return responseModel.messages.default.error;
        }
    }
    catch (e) {
        log.error(`${filename} > ${arguments.callee.name}: something went wrong - ${e}`);
        return e
    }
}

module.exports = runProcessSteps;
