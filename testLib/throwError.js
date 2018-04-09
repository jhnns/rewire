// Using deliberately const here because we know that we're transform const to let
const test = 1;

module.exports = function () {
    let test = 1;

    throw new Error();
};
