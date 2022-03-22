
const axios = require("axios");
const axiosRetry = require('axios-retry');
const { log } = require("../config/logger");
const { performance } = require('perf_hooks');
const filename = __filename.slice(__dirname.length + 1, -3);

class RESTNode {
    constructor(params, retryEnabled = true) {
        const uri = new URL(params.url);
        this.baseURL = uri.origin;
        this.pathname = uri.pathname;
        this.url = params.url;
        this.httpMethod = params.method;
        this.httpBody = params.body;
        this.httpHeaders = params.headers;
        this.httpTimeout = 0;
        this.httpMaxContentLength = 10000;
        this.retryEnabled = retryEnabled
        this.maxRetryCount = 3;
        this.delayRetry = 1500;
    }

    timeTaken(startDate) {
        var endDate = new Date();
        return (endDate.getTime() - startDate.getTime()) / 1000;
    }

    execute() {
        return new Promise((resolve, reject) => {
            var sdt = new Date();
            var axiosObj = axios.create({
                baseURL: this.baseURL,
                method: this.httpMethod,
                headers: this.httpHeaders,
                data: this.httpBody,
                timeout: this.httpTimeout,
                maxContentLength: this.httpMaxContentLength
            });

            if (this.retryEnabled) {
                axiosRetry(axiosObj, {
                    retries: this.maxRetryCount,
                    shouldResetTimeout: true,
                    retryDelay: (retryCount) => {
                       log.info(`${filename} > execute: execute: Retrying ${retryCount} / ${this.maxRetryCount}`);
                        return retryCount * this.delayRetry;
                    }
                });
            }

            axiosObj.request(this.pathname).then((response) => {
                var responseStatusCode = response.status || 200;
                var result = response.data;
                log.info(`${filename} > execute: success status code: ${responseStatusCode}`);
                log.info(`${filename} > execute: REST Node finished in ${this.timeTaken(sdt)}s`);
                log.debug(`${filename} > execute: API data - ${typeof (result) == "object" ? JSON.stringify(result) : result}`);
                resolve(result);
            }).catch((error) => {
                // var responseStatusCode = error.response.status;
                log.info(`${filename} > execute: REST Node finished in ${this.timeTaken(sdt)}s`);
                var errorDetails = {
                    status: error.response.status ? error.response.status : "500",
                    statusText: error.response.statusText ? error.response.statusText : "Fail",
                    message: error.message ? error.message : "Error"
                }
                reject(errorDetails);
            });
        });
    }
}

module.exports = RESTNode;

// const abc = new RESTNode({
//     "url": "https://reqres.in/api/users",
//     "method": "post",
//     "body": {
//         "name": "morpheus",
//         "job": "leader"
//     },
//     "headers": {}
// });

// abc.execute().then((res) => {
//     log.info(res);
// }).catch((err) => {
//     log.info("---");
//     log.info(err);
// });
