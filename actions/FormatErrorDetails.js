
function formatErrorDetails(e) {
    var err = {};

    if (e.message) {
        err.message = e.message;
    }
    if (e.stack) {
        err.stacktrace = e.stack;
    }
}

module.exports = formatErrorDetails;