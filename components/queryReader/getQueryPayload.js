

/**
 * The function gets the user query and return in a local object format
 * @param {*} inputObject user input
 * @returns 
 */
function getUserInput(inputObject) {
    if (!inputObject) throw Error("invalid input object");
    if (!("query" in inputObject)) throw Error("user query is not found in input object");
    if (!inputObject.query) throw Error("user query cannot be empty");

    const userQueryPayload = {
        query: inputObject.query
    }
    return userQueryPayload;
}


module.exports = { getUserInput }