'use strict';

const { log } = require("../config/logger");
const { performance } = require('perf_hooks');

class SearchTree {
    constructor(data) {
        this.data = data;
        this.searchElements = {};
        this.valuePaths = [];
        this.stack = [];
        this.dotPaths = [];
    }

    getValuePaths(){
        return this.valuePaths;
    }

    getDotPaths(){
        return this.dotPaths;
    }

    async execute(searchElements) {
        searchElements.forEach(e => {
            this.searchElements[e] = 0;
        });
        log.silly(`execute: tree traversing started to get path of slot values`);
        var st = performance.now();
        await this.#traverse(this.data, null);
        var tt = ((performance.now() - st) / 1000).toFixed(2);
        log.silly(`execute: tree traversing finished in ${tt}s`);
        return this.dotPaths;
    }

    #traverse(node, index) {
        log.debug(``)
        log.debug(`traverse: current stack values - ${this.stack}`);
        this.stack.push(node.value + '_' + index);
        log.debug(`traverse: pushed value to stack - ${node.value}`);

        if (Object.keys(this.searchElements).includes(node.value)) {
            this.searchElements[node.value] += 1
            if (!Object.values(this.searchElements).includes(0)) {
                log.info(`traverse: path found`);
                this.makePath();
            }
        }

        log.debug(`traverse: searchElements - ${JSON.stringify(this.searchElements)}`);
        node.values.forEach((e, i) => {
            this.#traverse(e, i);
            if (Object.keys(this.searchElements).includes(e.value)) {
                this.searchElements[e.value] -= 1
            }
            this.stack.pop();
            log.debug(`traverse: popped value from stack - ${this.stack[this.stack.length - 1]}`);
        });
    }

    makePath() {
        var path = [];
        var strPath = "";
        this.stack.forEach((obj, i) => {
            var v = obj.split("_");
            path.push(v[0]);
            if (v[1] != "null")  {
                strPath = strPath + ".values[" + v[1] + "]"
            }
        })
        this.valuePaths.push(path);
        this.dotPaths.push(strPath);
        log.debug(`makePath: value path formed - ${path}`);
        log.debug(`makePath: dot notation path formed - ${strPath}`);
    }
}


module.exports = SearchTree;