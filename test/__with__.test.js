var expect = require("expect.js"),
    __with__ = require("../lib/__with__.js"),
    __set__ = require("../lib/__set__.js"),
    vm = require("vm");

function expectError(ErrConstructor) {
    return function expectReferenceError(err) {
        expect(err.constructor.name).to.be(ErrConstructor.name);
    };
}

describe("__with__", function() {
    var moduleFake,
        newObj;

    beforeEach(function () {
        moduleFake = {
            module: {
                exports: {}
            },
            myValue: 0,    // copy by value
            myReference: {}       // copy by reference
        };

        newObj = { hello: "hello" };

        vm.runInNewContext(
            //__with__ requires __set__ to be present on module.exports
            "module.exports.__set__ = " + __set__.toString() + "; " +
            "__with__ = " + __with__.toString() + "; " +
            "getValue = function () { return myValue; }; " +
            "getReference = function () { return myReference; }; ",
            moduleFake
        );
    });

    it("should return a function", function () {
        expect(moduleFake.__with__({
            myValue: 2,
            myReference: newObj
        })).to.be.a("function");
    });

    it("should return a function that can be invoked with a callback which guarantees __sets__ undo function is called for you at the end", function () {
        expect(moduleFake.getValue()).to.be(0);
        expect(moduleFake.getReference()).to.eql({});

        moduleFake.__with__({
            myValue: 2,
            myReference: newObj
        })(function () {
            // changes will be visible from within this callback function
            expect(moduleFake.getValue()).to.be(2);
            expect(moduleFake.getReference()).to.be(newObj);
        });

        // undo will automatically get called for you after returning from your callback function
        expect(moduleFake.getValue()).to.be(0);
        expect(moduleFake.getReference()).to.eql({});
    });

    it("should still revert values if the callback throws an exception", function(){
        expect(function withError() {
            moduleFake.__with__({
                myValue: 2,
                myReference: newObj
            })(function () {
                throw new Error("something went wrong...");
            });
        }).to.throwError();
        expect(moduleFake.getValue()).to.be(0);
        expect(moduleFake.getReference()).to.eql({});
    });

    it("should throw an error if something other than a function is passed as the callback", function() {
        var withFunction = moduleFake.__with__({
                myValue: 2,
                myReference: newObj
            });

        function callWithFunction() {
            var args = arguments;

            return function () {
                withFunction.apply(null, args);
            };
        }

        expect(callWithFunction(1)).to.throwError();
        expect(callWithFunction("a string")).to.throwError();
        expect(callWithFunction({})).to.throwError();
        expect(callWithFunction(function(){})).to.not.throwError();
    });
});
