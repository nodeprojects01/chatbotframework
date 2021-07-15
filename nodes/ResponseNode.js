
const RESTNode = require("./RESTNode");
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

function response(type, message, options = []) {
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


async function reponseFormatter(resp) {
    var formattedResponse = [];
    if (resp && resp.length >= 1) {
        try {
            for (const m of resp) {
                var msg = m.content;
                if (m.contentType.indexOf("By") != -1) {
                    const ty = m.contentType.split("By");
                    if (ty[1] == dynamicResponseTypes.api) {
                        // call REST node
                        log.info(`${filename} > ${arguments.callee.name}: calling the RESTNode`);
                        const rn = new RESTNode(m.ext.params);
                        await rn.execute().then(succ => {
                            Object.keys(m.ext.replacePaths).forEach(p => {
                                const rm = lodash(succ, p);
                                msg = msg.replace(m.ext.replacePaths[p], rm);
                            });
                            var res = response(ty[0], msg, m.options);
                            formattedResponse.push(res);
                        }).catch(e => {
                            log.error(`${filename} > ${arguments.callee.name}: error while fetching api data`);
                            throw new Error("error while fetching api data");
                        });
                    }
                }
                else {
                    var res = response(m.contentType, msg, m.options);
                    formattedResponse.push(res);
                }
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
    return formattedResponse;
}

module.exports = { response, responseTypes, reponseFormatter };

// var resp = response(responseTypes.quickReplies, "I can help you with below options", ["timesheet", "payslip"]);
// console.log(resp.message());