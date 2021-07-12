'use strict';

const { log } = require("../config/logger");
const { performance } = require('perf_hooks');

class SearchTree {
    constructor(data) {
        this.data = data;
        this.searchElements = {};
        this.paths = [];
        this.stack = [];
    }

    async getPath(searchElements) {
        searchElements.forEach(e => {
            this.searchElements[e] = 0;
        });
        log.silly(`getPath: tree traversing started to get path of slot values`);
        var st = performance.now();
        await this.#traverse(this.data);
        var tt = ((performance.now() - st)/1000).toFixed(2);
        log.silly(`getPath: tree traversing finished in ${tt}s`);
        return this.paths;
    }

    #traverse(node) {
        log.debug(``)
        log.debug(`traverse: current stack values - ${this.stack}`);
        this.stack.push(node.value);
        log.debug(`traverse: pushed value to stack - ${node.value}`);
        if (Object.keys(this.searchElements).includes(node.value)) {
            this.searchElements[node.value] += 1
            if (!Object.values(this.searchElements).includes(0)) {
                this.paths.push(JSON.stringify(this.stack));
                log.debug(`traverse: path found - ${this.paths}`);
            }
        }

        log.debug(`traverse: searchElements - ${JSON.stringify(this.searchElements)}`);
        node.values.forEach(element => {
            this.#traverse(element, this.stack);
            if (Object.keys(this.searchElements).includes(element.value)) {
                this.searchElements[element.value] -= 1
            }
            this.stack.pop();
            log.debug(`traverse: popped value from stack - ${this.stack[this.stack.length - 1]}`);
        });

    }
}


module.exports = SearchTree;