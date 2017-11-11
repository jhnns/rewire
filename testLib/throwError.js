// Using const here because we know that Babel will transform that part
const test = 1;

module.exports = function () {
    let test = 1;

    throw new Error();
};
