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
const { initialize } = require("./components/initializer/loadAppConfigs");


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
        const inputObj = req.body;
        executeSteps(inputObj).then((resp) => {
            log.info(`${filename} > getQueryResponse - process completed`);
            res.send(xssFilter({ statusCode: 200, data: resp }));
        }).catch(e => {
            log.error(`${filename} > getQueryResponse - error while processing the request - ${JSON.stringify(formatErrorDetails(e))}`);
            res.send(xssFilter({ statusCode: 500, msg: "error while processing the request in getQueryResponse" }));
        });
    }
    catch (e) {
        log.error(`${filename} > getQueryResponse - error - ${JSON.stringify(formatErrorDetails(e))}`);
    }
});



// ================= For testing ========================

async function start() {
    try {

        executeSteps({ query: "download us efile and canada efile report" }).then((res) => {
            console.log("response =>", res);
            console.log("process completed");
        }).catch(e => {
            log.error(`${filename} > start - error - ${JSON.stringify()}`)
        });
    }
    catch (e) {
        log.error(`${filename} > start - error - ${JSON.stringify(e)}`);
    }
}

// load application configs and chatbot manifest files
initialize().then(r => {
    app.listen(port, () => {
        log.info(`framework is listening to port: ${port}`);
    });
    // executeSteps({ query: "download us efile and canada efile report" }).then((res) => {
    //     console.log("response =>", res);
    //     console.log("process completed");
    // }).catch(e => {
    //     log.error(`${filename} > start - error - ${e}`)
    // });
}).catch(e => console.log("error", e));



// start();

// ================= For testing ========================