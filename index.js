'use strict';

const model = require("./schema/botModel.json");
const response = require("./schema/responseModel.json");
const { log } = require("./config/logger");
const SearchTree = require("./nodes/TraverseNode");

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

function checkValueInObjectArray(arr, key, value) {
    var res = null;
    arr.forEach(element => {
        if (element[key] == value) {
            res = element;
        }
    });
    return res;
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
        const rootNode = checkValueInObjectArray(model.intents, "value", event.intent);
        if (rootNode) {
            const slots = getSlotValues(event.slots);
            log.info(`main: input event contains ${slots.length} slot values`);
            if (slots.length >= 1) {
                const paths = await new SearchTree(rootNode).getPath(slots);
                log.info(`main: identified ${paths.length} paths`);
                if (paths.length >= 2) {
                    // return generic message for confirmation
                }
                else if (paths.length == 1) {
                    // if it not a leaf node (or response type is close) then return the message 
                    // else ask for next slot options
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