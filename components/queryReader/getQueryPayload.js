

/**
 * The function gets the user query and return in a local object format
 * @param {*} inputObject user input
 * @returns 
 */
function getUserInput(inputObject) {
    const userQueryPayload = {
        query: inputObject.query ? inputObject.query : ""
    }
    return userQueryPayload;
}


module.exports = { getUserInput }