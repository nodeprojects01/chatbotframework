
const { log } = require("../../config/logger");
const { performance } = require('perf_hooks');
const { isJSON } = require('../../utils/helper');
const filename = __filename.slice(__dirname.length + 1, -3);

class SearchTree {
    constructor(data) {
        if (!isJSON(data))
            throw new Error("invalide JSON input");

        this.data = data;
        this.entitiesToSearch = {};
        this.valuePaths = [];
        this.stack = [];
        this.dotPaths = [];
    }

    getValuePaths() {
        return this.valuePaths;
    }

    getDotPaths() {
        return this.dotPaths;
    }

    async execute(entitiesToSearch) {
        entitiesToSearch.forEach(e => {
            this.entitiesToSearch[e] = 0;
        });
        log.silly(`${filename} > execute: tree traversing started to get path of entity values`);
        var st = performance.now();
        await this.#traverse(this.data, null);
        var tt = ((performance.now() - st) / 1000).toFixed(2);
        log.silly(`${filename} > execute: tree traversing finished in ${tt}s`);
        return this.dotPaths;
    }

    #traverse(node, index) {
        log.debug(`${filename} > traverse: `);
        log.debug(`${filename} > traverse: current stack values - ${this.stack}`);
        this.stack.push(node.value + '_' + index);
        log.debug(`${filename} > traverse: pushed value to stack - ${node.value}`);

        if (Object.keys(this.entitiesToSearch).includes(node.value)) {
            this.entitiesToSearch[node.value] += 1
            if (!Object.values(this.entitiesToSearch).includes(0)) {
                log.info(`${filename} > traverse: path found`);
                this.makePath();
            }
        }

        log.debug(`${filename} > traverse: entitiesToSearch - ${JSON.stringify(this.entitiesToSearch)}`);
        node.values.forEach((e, i) => {
            this.#traverse(e, i);
            if (Object.keys(this.entitiesToSearch).includes(e.value)) {
                this.entitiesToSearch[e.value] -= 1
            }
            this.stack.pop();
            log.debug(`${filename} > traverse: popped value from stack - ${this.stack[this.stack.length - 1]}`);
        });
    }

    makePath() {
        var path = [];
        var strPath = "";
        this.stack.forEach((obj, i) => {
            var v = obj.split("_");
            path.push(v[0]);
            if (v[1] != "null") {
                strPath = strPath + ".values[" + v[1] + "]"
            }
        })
        this.valuePaths.push(path);
        this.dotPaths.push(strPath);
        log.debug(`${filename} > makePath: value path formed - ${path}`);
        log.debug(`${filename} > makePath: dot notation path formed - ${strPath}`);
    }

    getPathsOfValue(obj, value) {
        return Object
            .keys(obj)
            .reduce((r, k) => {
                var kk = Array.isArray(obj) ? `${k}` : `${k}`;
                if (obj[k] === value) {
                    r.push(kk);
                }
                if (obj[k] && typeof obj[k] === 'object') {
                    r.push(...getPathsOfValue(obj[k], value).map(p => kk + (p[0] === '[' ? '' : '.') + p));
                }
                return r;
            }, []);
    }
}


module.exports = SearchTree;