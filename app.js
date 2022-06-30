const express = require("express");
const app = express();
const cors = require("cors");
const port = 8080;
const { log } = require("./config/logger");
const xssFilters = require("xss-filters");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const filename = __filename.slice(__dirname.length + 1);
const executeSteps = require("./index.js");
const formatErrorDetails = require("./actions/FormatErrorDetails");
const { initialize, loadInputRequest } = require("./components/initializer/loadAppConfigs");
const { identifier } = require("jsonpath/lib/dict");


function xssFilter(obj) {
    if (!obj) return null;
    const strRes = xssFilters.inHTMLData(JSON.stringify(obj));
    return JSON.parse(strRes);
}

app.get("/", (req, res) => {
    res.send("framework is active");
});

app.get("/health", (req, res) => {
    res.sendStatus(200);
});

app.post("/getQueryResponse", async (req, res) => {
    try {
        log.info(`${filename} > getQueryResponse`);
        if (!("convid" in req.headers) || !("transid" in req.headers)) {
            log.error(`${filename} > getQueryResponse - the request does't contain conversation id and transaction id in context headers`);
            res.send(xssFilter({ statusCode: 500, msg: "the request does't contain conversation id and transaction id in context headers" }));
        }
        else {
            const inputObj = { ...req.body, convId: req.headers.convid, transId: req.headers.transid };
            log.debug(`${filename} > getQueryResponse - chatContext contains - ${JSON.stringify(inputObj)}`);
            executeSteps(inputObj).then((resp) => {
                log.info(`${filename} > getQueryResponse - process completed`);
                const heads = {
                    convid: req.headers.convid,
                    transid: req.headers.transid
                };

                for (const [k, v] of Object.entries(heads)) {
                    res.setHeader(k, v);
                }
                res.send(xssFilter({ statusCode: 200, data: resp }));
            }).catch(e => {
                log.error(`${filename} > getQueryResponse - error while processing the request - ${JSON.stringify(formatErrorDetails(e))}`);
                res.send(xssFilter({ statusCode: 500, msg: "error while processing the request in getQueryResponse" }));
            });
        }
    }
    catch (e) {
        log.error(`${filename} > getQueryResponse - error - ${JSON.stringify(formatErrorDetails(e))}`);
    }
});

function setContextHeaders(obj) {
    for (const [k, v] of Object.entries(obj)) {
        res.setHeader(k, v);
    }
}


// load application configs and chatbot manifest files
// once loaded, start the application
initialize().then(() => {
    app.listen(port, () => {
        log.info(`chatbot framework is listening to port: ${port}`);
    });
}).catch(e => console.log("error while initializing the application", e));

// ================= For testing ========================

// initialize().then(r => {
//     executeSteps({ query: "download canada efile report" }).then((res) => {
//         console.log("response =>", res);
//         console.log("process completed");
//     }).catch(e => {
//         log.error(`${filename} > start - error - ${e}`)
//     });
// }).catch(e => console.log("error", e));

// ================= For testing ========================