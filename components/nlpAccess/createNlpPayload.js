

/**
 * The function formats to NLP input template with user input details
 * @param {*} userQueryPayload 
 * @returns 
 */
 function createNlpPayload(userQueryPayload) {
    const nlpPayload = {
        query: userQueryPayload.query
    }
    return nlpPayload;
}

module.exports = { createNlpPayload }