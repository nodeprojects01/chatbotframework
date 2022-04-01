const config = require("../../config/config");
const responseModel = require("../.." + config.responseModelPath);
const RESTNode = require("../../actions/RESTCall");
const lodash = require('lodash.get');
const { log } = require("../../config/logger");
const { performance } = require('perf_hooks');
const filename = __filename.slice(__dirname.length + 1, -3);

const messageTypes = {
    plainText: "PlainText",
    quickReplies: "QuickReplies",
    date: "Date",
    hyperLink: "HyperLink",
    multiLine: "MultiLine",
    carousel: "Carousel",
    plainTextByApi: "PlainTextByApi",
    plainTextByEntities: "PlainTextByEntities"
}

async function getPlainTextByApi(responseNode) {
    log.info(`${filename} > ${arguments.callee.name}: calling the RESTNode`);
    var msg = responseNode.message;
    const rn = new RESTNode(responseNode.ext.params);
    await rn.execute().then(succ => {
        Object.keys(responseNode.ext.replacePaths).forEach(p => {
            const rm = lodash(succ, p);
            msg = msg.replace(responseNode.ext.replacePaths[p], rm);
        });
        return { ...responseNode, message: msg };
    }).catch(e => {
        log.error(`${filename} > ${arguments.callee.name}: error while fetching api data`);
        throw new Error("error while fetching api data");
    });
}

function getQuickReplies(responseNode, targetNode) {
    // check the format of the options and prepare for response
    // [] - add all entity values as options, ["val1", "val2", "val3"] - options pre-defined
    var responseOptions = responseNode.options ? responseNode.options : [];
    if (responseNode.options && responseNode.options.length === 0) {
        targetNode.values.forEach(o => {
            responseOptions.push({
                "displayName": o.value,
                "actualMessage": o.value
            });
        });
    }
    return { ...responseNode, options: responseOptions };
}

async function getPlainTextByEntities(responseNode, entities) {
    var msg = responseNode.message;
    Object.keys(responseNode.replaceCondition.replacePaths).forEach(p => {
        msg = msg.replace(p, entities[responseNode.replaceCondition.replacePaths[p]]);
    });
    return { ...responseNode, message: msg };

}

async function reponseFormatter(targetNode, nlpEvent) {
    const msgArr = responseModel.messages[targetNode.message];
    var formattedResponse = [];
    if (msgArr && msgArr.length >= 1) {
        try {
            for (const m of msgArr) {
                var resp = "";
                switch (m.messageType) {
                    case messageTypes.plainTextByApi:
                        resp = await getPlainTextByApi(m);
                        break;
                    case messageTypes.quickReplies:
                        resp = await getQuickReplies(m, targetNode);
                        break;
                    case messageTypes.plainTextByEntities:
                        resp = await getPlainTextByEntities(m, nlpEvent.entities);
                        break;
                    case messageTypes.plainText:
                    default:
                        resp = m;
                }
                formattedResponse.push(botResp);
            }
            targetNode.message = formattedResponse;
            return targetNode;
        }
        catch (e) {
            console.log(e);
            log.error(`${filename} > ${arguments.callee.name}: error while formatting the response - ${e.message}`);
            throw new Error(`error while formatting the response`);
        }
    }
    else {
        log.error(`${filename} > ${arguments.callee.name}: invalid input response`);
        throw new Error("invalid input response");
    }
}

async function resolveResponseFormats(responseNode) {
    if (responseNode.targetNode.value) {
        return await reponseFormatter(responseNode.targetNode, responseNode.nlpEvent).then(res => {
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


module.exports = { resolveResponseFormats }