
const RESTNode = require("./RESTNode");
const responseModel = require("../schema/responseModel.json");
const lodash = require('lodash.get');
const { log } = require("../config/logger");
const { performance } = require('perf_hooks');
const filename = __filename.slice(__dirname.length + 1, -3);

class PlainText {
    constructor(message) {
        this.type = this.constructor.name;
        this.msg = message;
    }

    message() {
        return {
            type: this.type,
            message: this.msg
        };
    }
}

class QuickReplies extends PlainText {
    constructor(message, options) {
        super(message);
        this.options = options;
    }

    message() {
        return {
            type: this.type,
            message: this.msg,
            options: this.options
        };
    }
}

class Carousel extends QuickReplies {
    constructor(message, options) {
        super(message);
        this.options = options;
    }

    message() {
        return {
            type: this.type,
            message: this.msg,
            options: this.options
        };
    }
}

const responseTypes = {
    plainText: "PlainText",
    quickReplies: "QuickReplies",
    carousel: "Carousel",
}

const dynamicResponseTypes = {
    api: "Api",
    image: "Image",
    database: "Database"
}

function responseInstance(type, message, options = []) {
    try {
        if (Object.values(responseTypes).includes(type)) {
            switch (type) {
                case "PlainText":
                    return new PlainText(message);
                case "QuickReplies":
                    return new QuickReplies(message, options);
                case "Carousel":
                    return new Carousel(message, options);
            }
        }
        else {
            log.error(`${filename} > ${arguments.callee.name}: invalid respose type`);
            throw new Error("invalid respose type");
        }
    }
    catch (e) {
        return e;
    }
}

async function apiResponse(responseNode, responseType) {
    log.info(`${filename} > ${arguments.callee.name}: calling the RESTNode`);
    var msg = responseNode.content;
    var formattedResponse = [];
    const rn = new RESTNode(responseNode.ext.params);
    await rn.execute().then(succ => {
        Object.keys(responseNode.ext.replacePaths).forEach(p => {
            const rm = lodash(succ, p);
            msg = msg.replace(responseNode.ext.replacePaths[p], rm);
        });
        var res = responseInstance(responseType, msg, responseNode.options);
        formattedResponse.push(res.message());
    }).catch(e => {
        log.error(`${filename} > ${arguments.callee.name}: error while fetching api data`);
        throw new Error("error while fetching api data");
    });
    return formattedResponse;
}

function getButtonOptions(responseNode, targetNode) {
    // check the format of the options and prepare for response
    // [] - options not required, [*] - add all slot values as options, ["val1", "val2", "val3"] - options pre-defined
    var formattedResponse = [];
    if (!responseNode.options || responseNode.length == 0) {
        return formattedResponse;
    }

    if (responseNode.options[0] == "*") {
        var targetSlots = [];
        targetNode.values.forEach(o => {
            targetSlots.push(o.value);
        });
        var res = responseInstance(responseNode.contentType, responseNode.content, targetSlots);
        formattedResponse.push(res.message());
    }
    else {
        var res = responseInstance(responseNode.contentType, responseNode.content, responseNode.options);
        formattedResponse.push(res.message());
    }
    return formattedResponse;
}

async function reponseFormatter(targetNode) {
    const resp = responseModel.messages[targetNode.message];
    var formattedResponse = [];
    if (resp && resp.length >= 1) {
        try {
            for (const m of resp) {
                if (m.contentType.indexOf("By") != -1) {
                    const ty = m.contentType.split("By");
                    if (ty[1] == dynamicResponseTypes.api) {
                        // call REST node
                        var apiResp = await apiResponse(m, ty[0]);
                        // console.log(apiResp);
                        formattedResponse = formattedResponse.concat(apiResp);
                    }
                }
                var buttonResp = getButtonOptions(m, targetNode);
                // console.log(buttonResp);
                formattedResponse = formattedResponse.concat(buttonResp);
                // }
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

module.exports = { responseTypes, reponseFormatter };
