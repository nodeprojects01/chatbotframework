'use strict';

const { log } = require("../config/logger");
const { performance } = require('perf_hooks');

class SearchTree {
    constructor(data) {
        this.data = data;
        this.searchElements = {};
        this.paths = [];
        this.stack = [];
        this.dotPath = [];
    }

    async getPath(searchElements) {
        searchElements.forEach(e => {
            this.searchElements[e] = 0;
        });
        log.silly(`getPath: tree traversing started to get path of slot values`);
        var st = performance.now();
        await this.#traverse(this.data, null);
        var tt = ((performance.now() - st) / 1000).toFixed(2);
        log.silly(`getPath: tree traversing finished in ${tt}s`);
        return this.dotPath;
    }

    #traverse(node, index) {
        log.debug(``)
        log.debug(`traverse: current stack values - ${this.stack}`);
        this.stack.push(node.value + '_' + index);
        log.debug(`traverse: pushed value to stack - ${node.value}`);

        if (Object.keys(this.searchElements).includes(node.value)) {
            this.searchElements[node.value] += 1
            if (!Object.values(this.searchElements).includes(0)) {
                // this.paths.push(this.stack.slice());
                this.makePath();
                log.debug(`traverse: path found - ${this.paths}`);
            }
        }

        log.debug(`traverse: searchElements - ${JSON.stringify(this.searchElements)}`);
        node.values.forEach((e, i) => {
            log.info("index-" + i);
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
        var valuePath = "";
        this.stack.forEach((obj, i) => {
            var v = obj.split("_");
            path.push(v[0]);
            if (v[1] != "null")  {
                valuePath = valuePath + ".values[" + v[1] + "]"
            }
        })
        this.paths.push(path);
        this.dotPath.push(valuePath);
    }
}


module.exports = SearchTree;