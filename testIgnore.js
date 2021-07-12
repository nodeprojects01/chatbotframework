var jp = require('jsonpath');

const data = require('./schema/botModel.json');

var authors = jp.value(data, '$..message');

console.log(authors);