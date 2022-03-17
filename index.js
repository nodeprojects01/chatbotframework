
const model = require("./schema/botModel.json");
const responseModel = require("./schema/responseModel.json");
const { log } = require("./config/logger");
const SearchTree = require("./nodes/TraverseNode");
const ResponseNode = require("./nodes/ResponseNode");
const lodash = require('lodash.get');
const { level } = require("winston");
const filename = __filename.slice(__dirname.length + 1, -3);

const event = {
    conversationId: "ax1234bernzzz234499",  // can also be identified as session id
    transactionId: "22344541",
    query: "hello",
    intent: "Drivewise",
    slots: {
        "TopCategories": null,
        "DeviceConcerns": "Replace",
        "OnboardingType": null,
        "State": "NY",
        "Address": null
    },
    sessionAttributes: {}
}

function getSlotValues(slots) {
    var availableSlots = [];
    for (const k of Object.keys(slots)) if (slots[k]) availableSlots.push(slots[k]);
    return availableSlots;
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

async function main(event) {
    try {
        var targetNode = "";
        const rootNode = model.intents.filter(o => o.value == event.intent);
        if (rootNode) {
            const slots = getSlotValues(event.slots);
            log.info(`${filename} > ${arguments.callee.name}: input event contains ${slots.length} slot values`);
            if (slots.length >= 1) {
                const st = new SearchTree(rootNode[0]);
                await st.execute(slots);
                const dotPaths = st.getDotPaths();
                log.info(`${filename} > ${arguments.callee.name}: identified ${dotPaths.length} paths`);
                log.debug(`${filename} > ${arguments.callee.name}: paths - ${dotPaths}`);

                const intentIndex = model.intents.findIndex(item => item.value === event.intent);
                if (dotPaths.length >= 2) {
                    // return generic message for confirmation
                    var targetNode = "";
                    const vp = st.getValuePaths();
                    // console.log("vp -", vp);

                    vp[0].some((v, i) => {
                        // console.log(v, " <==> ", vp[1][i])
                        if (v != vp[1][i]) {
                            const strPath = `intents[${intentIndex}]` + dotPaths[0];
                            var ii = nth_occurrence(strPath, '.', i);
                            targetNode = lodash(model, strPath.substr(0, ii));
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
                    // else ask for next slot options
                    const strPath = `intents[${intentIndex}]` + dotPaths[0];
                    const targetNode = lodash(model, strPath);
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
                    // bot model must have invalid values that are not matching the bot's slot values
                    log.error(`${filename} > ${arguments.callee.name}: bot model must have invalid values that are not matching the bot's slot values`);
                    return responseModel.messages.default.error;
                }
            }
            else {
                // when no slots are available, guide user flow from the root node
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
            // bot model must have invalid values that are not matching the bot's slot values
            log.error(`${filename} > ${arguments.callee.name}: bot model must have invalid intent name that is not matching the bot's intent`);
            return responseModel.messages.default.error;
        }
    }
    catch (e) {
        console.log(e)
        log.error(`${filename} > ${arguments.callee.name}: something went wrong - ${e}`);
        return e
    }
}


main(event).then((res) => {
    console.log("response =>", res);
    console.log("process completed");
});