
const config = require("../../config/config");
const { log } = require("../../config/logger");
const filename = __filename.slice(__dirname.length + 1, -3);
require("../../globalVars");

async function readConfigurations() {
    log.info(`${filename} > ${arguments.callee.name} - reading application configuarations`);
    if (!config) throw Error("config file is invalid");
}

async function loadManifests() {
    log.info(`${filename} > ${arguments.callee.name} - loading chatbot manifest files`);

    if (!config.botModelPath) throw Error("botModelPath is required");
    if (!config.responseModelPath) throw Error("responseModelPath is required");
    const botModel = require("../../" + config.botModelPath);
    const responseModel = require("../../" + config.responseModelPath);

    if (!botModel) throw Error("botModel not found");
    if (!responseModel) throw Error("responseModel not found");

    global.appSessionMemory.manifests = { botModel, responseModel };
}

async function initialize() {
    await readConfigurations();
    await loadManifests();
    log.info(`${filename} > ${arguments.callee.name} - ${config.appName} is initialized`);
}


module.exports = { initialize }