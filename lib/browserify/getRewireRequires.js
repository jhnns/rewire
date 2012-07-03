/***
 * Searches for rewire(); statements and returns all strings that are between the brackets.
 *
 * @param {!String} src
 * @return {Array}
 */
function getRewireRequires(src) {
    var result = [],
        regExp = /[^a-zA-Z0-9_]rewire\(["'](.+?)["']\)/g,
        match;

    src = " " + src;    // ensure that rewire() is not at index 0 otherwise the regexp won't work in this case
    match = regExp.exec(src);
    while (match !== null) {
        result.push(match[1]);
        match = regExp.exec(src);
    }

    return result;
}

module.exports = getRewireRequires;