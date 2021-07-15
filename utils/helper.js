function isJSON(v) {
    if (typeof v == 'object') {
        v = JSON.stringify(v);
        try {
            JSON.parse(v);
            return true;
        } catch (e) {
            return false;
        }
    }
    else {
        return false;
    }

}

module.exports = {
    isJSON
}