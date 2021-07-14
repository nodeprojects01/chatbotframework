'use strict';

const model = require("./schema/botModel.json");
const response = require("./schema/responseModel.json");
const { log } = require("./config/logger");
const SearchTree = require("./nodes/TraverseNode");
const lodash = require('lodash.get');

const event = {
    query: "hello",
    intent: "Drivewise",
    slots: {
        "TopCategories": "Device",
        "DeviceConcerns": "Replace",
        "OnboardingType": null,
        "State": null,
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

async function main(event) {
    try {
        const rootNode = model.intents.filter(o => { return o.value == event.intent });
        const intentIndex = model.intents.findIndex(item => item.value === event.intent );
        
        if (rootNode) {
            const slots = getSlotValues(event.slots);
            log.info(`main: input event contains ${slots.length} slot values`);
            if (slots.length >= 1) {
                const paths = await new SearchTree(rootNode[0]).getPath(slots);
                log.info(`main: identified ${paths.length} paths`);
                log.debug(`main: paths - ${paths}`);
                if (paths.length >= 2) {
                    // return generic message for confirmation
                    const strPath = `intents[${intentIndex}]` + paths[1];
                    const targetNode = lodash(model, strPath);
                }
                else if (paths.length == 1) {
                    // if it not a leaf node (or response type is close) then return the message 
                    // else ask for next slot options
                    const strPath = `intents[${intentIndex}]` + paths[0];
                    const targetNode = lodash(model, strPath);
                }
                else {
                    // return exception message
                    // bot model must have invalid values that are not matching the bot's slot values
                    log.error(`main: bot model must have invalid values that are not matching the bot's slot values`);
                }
                return await {};
            }
        }
    }
    catch (e) {
        log.error(`main: something went wrong - ${e}`);
        return e
    }
}


main(event).then((res) => {
    log.info(JSON.stringify(res));
});