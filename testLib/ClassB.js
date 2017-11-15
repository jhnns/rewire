const AClass = require("./ClassA");

class ClassB extends AClass {
    get prop1() {
        return "B";
    }

    method1() {
        return "testB";
    }
}

module.exports = ClassB;
