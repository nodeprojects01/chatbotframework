
const { log } = require("../../config/logger");
const { performance } = require('perf_hooks');
const { isJSON } = require('../../utils/helper');
const filename = __filename.slice(__dirname.length + 1, -3);
const moment = require('moment');
const lodash = require('lodash.get');

class SearchTree {
    constructor(data, entities) {
        if (!isJSON(data))
            throw new Error("invalide JSON input");

        this.data = data;
        this.entitiesToSearch = {};
        this.entities = entities;
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

    getRequiredPaths() {
        return this.isrequired;
    }

    async execute() {
        Object.keys(this.entities).map(e => {
            if (this.entities[e] != null) {
                this.entitiesToSearch[e] = {
                    "visit": 0,
                    "value": this.entities[e]
                };
            }
        })
        log.silly(`${filename} > execute: tree traversing started to get path of entity values`);
        var st = performance.now();
        await this.traverse(this.data, null, this.data.entity);
        var tt = ((performance.now() - st) / 1000).toFixed(2);
        log.silly(`${filename} > execute: tree traversing finished in ${tt}s`);
        return this.dotPaths;
    }

    traverse(node, index, entity) {
        log.debug(`${filename} > traverse: `);
        log.debug(`${filename} > traverse: current stack values - ${this.stack}`);
        var req = 0
        var isValidValue = this.isvalueValid(node.valueType, this.entitiesToSearch[entity] ? this.entitiesToSearch[entity].value : "", node.value);
        // if (node.required == true && !isValidValue) {
        //     req = 1;
        // }
        this.stack.push(node.value + '_' + index);
        log.debug(`${filename} > traverse: pushed value to stack - ${node.value}`);

        if (Object.keys(this.entitiesToSearch).includes(entity) && isValidValue) {
            this.entitiesToSearch[entity]['visit'] += 1
            if (Object.values(this.entitiesToSearch).filter(f => f.visit == 0).length == 0) {
                this.makePath();
            }
        }
        log.debug(`${filename} > traverse: entitiesToSearch - ${JSON.stringify(this.entitiesToSearch)}`);

        node.values.forEach((e, i) => {
            this.traverse(e, i, node.entity);
            if (Object.keys(this.entitiesToSearch).includes(node.entity) && this.isvalueValid(e.valueType, this.entitiesToSearch[node.entity].value, e.value)) {
                this.entitiesToSearch[node.entity]['visit'] -= 1;
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

    isvalueValid(action, entityValue, nodeValue) {
        var valueTypeValid = false;
        if (action == "date") {
            valueTypeValid = moment(entityValue, nodeValue, true).isValid()
        }
        else if (action == "regex") {
            var re = new RegExp(nodeValue, 'i')
            valueTypeValid = re.test(entityValue);

        }
        else if (entityValue.toLowerCase() == nodeValue.toLowerCase()) {
            valueTypeValid = true
        }
        return valueTypeValid;
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

    async checkRequiredNodeinDotPath(node, path, finalTargetNode = "") {
        var pos = path.indexOf('.');

        var currentValue = path.substring(0, pos);
        var currentNode = lodash(node, currentValue);
        if (currentNode && currentNode.required && !this.isvalueValid(currentNode.valueType, this.entities[node.entity], currentNode.value)) {
            return finalTargetNode;
        }
        else if (pos == -1) {
            finalTargetNode = finalTargetNode + "." + path
            return finalTargetNode;
        }
        else {
            finalTargetNode = finalTargetNode + "." + currentValue
        }
        return this.checkRequiredNodeinDotPath(currentNode, path.substring(pos + 1), finalTargetNode)
    }
}


module.exports = SearchTree;