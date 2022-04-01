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
const runProcessSteps = require("./index.js");
const moment = require('moment');

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
        const eventObj = req.body;
        runProcessSteps(eventObj).then((resp) => {
            log.info(`${filename} > getQueryResponse - process completed`);
            res.send(xssFilter({ statusCode: 200, data: resp }));
        }).catch(e => {
            log.error(`${filename} > getQueryResponse - error while processing the request - ${JSON.stringify(e)}`);
            res.send(xssFilter({ statusCode: 500, msg: "error while processing the request in getQueryResponse" }));
        });
    }
    catch (e) {
        log.error(`${filename} > getQueryResponse - error - ${JSON.stringify(e)}`);
    }
});


// app.listen(port, () => {
//     log.info(`framework is listening to port: ${port}`);
// });

// ================= For testing ========================

const event = {
    conversationId: "ax1234bernzzz234499",  // can also be identified as session id
    transactionId: "22344541",
    query: "hello",
    intent: "business metrics report",
    entities: {
        "ReportType": null,
        "EfileType": "Puerto Rico eFile",
        "StartDate":null,
        "EndDate":"11/12/2020",
    },
    sessionAttributes: {}
}

runProcessSteps(event).then((res) => {
    console.log("response =>", res);
    console.log("process completed");
});

// ================= For testing ========================


