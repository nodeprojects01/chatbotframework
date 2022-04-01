const config = require("../config/config");
const responseModel = require(".." + config.responseModelPath);
const RESTNode = require("./RESTCall");
const lodash = require('lodash.get');
const { log } = require("../config/logger");
const { performance } = require('perf_hooks');
const filename = __filename.slice(__dirname.length + 1, -3);

function botResponse(obj) {
    try {
        return {
            messageType: obj.messageType ? obj.messageType : messageTypes.plainText,
            message: obj.message ? obj.message : "",
            options: obj.options ? obj.options : []
        };
    }
    catch {
        log.error(`${filename} > ${arguments.callee.name}: invalid input object`);
        throw new Error("invalid input object");
    }
}

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

async function getPlainTextByApi(responseNode, messageType) {
    log.info(`${filename} > ${arguments.callee.name}: calling the RESTNode`);
    var msg = responseNode.content;
    const rn = new RESTNode(responseNode.ext.params);
    await rn.execute().then(succ => {
        Object.keys(responseNode.ext.replacePaths).forEach(p => {
            const rm = lodash(succ, p);
            msg = msg.replace(responseNode.ext.replacePaths[p], rm);
        });
        return botResponse({ messageType: messageType, message: msg, options: responseNode.options });
    }).catch(e => {
        log.error(`${filename} > ${arguments.callee.name}: error while fetching api data`);
        throw new Error("error while fetching api data");
    });
}
async function getPlainTextByEntities(responseNode,entities,messageType){
    var msg = responseNode.message;
    Object.keys(responseNode.replaceCondition.replacePaths).forEach(p => {
        msg = msg.replace(p, entities[responseNode.replaceCondition.replacePaths[p]]);
    });
    return botResponse({ messageType: messageType, message: msg, options: responseNode.options });

}
function getQuickReplies(responseNode, targetNode) {
    // check the format of the options and prepare for response
    // [] - add all entity values as options, ["val1", "val2", "val3"] - options pre-defined
    var responseOptions = responseNode.options ? responseNode.options : [];
    if (responseNode.options && responseNode.options.length === 0) {
        targetNode.values.forEach(o => {
            responseOptions.push(o.value);
        });
    }
    return botResponse({ ...responseNode, options: responseOptions });
}

async function reponseFormatter(targetNode,entities) {
    const msgArr = responseModel.messages[targetNode.message];
    var formattedResponse = [];
    if (msgArr && msgArr.length >= 1) {
        try {
            for (const m of msgArr) {
                var resp = "";
                switch (m.messageType) {
                    case messageTypes.plainTextByApi:
                        resp = await getPlainTextByApi(m, m.messageType);
                        break;
                    case messageTypes.plainTextByEntities:
                        resp = await getPlainTextByEntities(m,entities, m.messageType);
                        break;
                    case messageTypes.quickReplies:
                        resp = await getQuickReplies(m, targetNode);
                        break;
                    default:
                        resp = botResponse(m);
                }
                formattedResponse.push(resp);
            }
            return formattedResponse;
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

module.exports = { messageTypes, reponseFormatter };
