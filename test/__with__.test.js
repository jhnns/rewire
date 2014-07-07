var expect = require("expect.js"),
    __with__ = require("../lib/__with__.js"),
    __set__ = require("../lib/__set__.js"),
    vm = require("vm"),
    expectReferenceError = expectError(ReferenceError),
    expectTypeError = expectError(TypeError);

function expectError(ErrConstructor) {
    return function expectReferenceError(err) {
        expect(err.constructor.name).to.be(ErrConstructor.name);
    };
}

describe("__with__", function() {
    var moduleFake;

    beforeEach(function () {
        moduleFake = {
            module: {
                exports: {}
            },
            myValue: 0,    // copy by value
            myReference: {}       // copy by reference
        };

        //__with__ requires __set__ to be in scope
        vm.runInNewContext(
            "module.exports.__set__ = " + __set__.toString() + "; " +
            "__with__ = " + __with__.toString() + "; " +
            "getValue = function () { return myValue; }; " +
            "getReference = function () { return myReference; }; ",
            moduleFake
        );
    });

    it("should return a function that can be invoked with a callback which guarantees __sets__ undo function is called for you at the end", function () {
        var newObj = { hello: "hello" };

        expect(moduleFake.getValue()).to.be(0);
        expect(moduleFake.getReference()).to.eql({});

        moduleFake.__with__({
            myValue: 2,
            myReference: newObj
        })(function() {
          //changes will be visible from within this callback function
          expect(moduleFake.getValue()).to.be(2);
          expect(moduleFake.getReference()).to.be(newObj);
        });

        //undo will automatically get called for you after returning from your callback function
        expect(moduleFake.getValue()).to.be(0);
        expect(moduleFake.getReference()).to.eql({});
    });

    it("should still revert values if the callback throws an exception", function(){
        var newObj = { hello: "hello" };
        function withError(){
          moduleFake.__with__({
              myValue: 2,
              myReference: newObj
          })(function() {
            throw new Error("something went wrong...");
          });
        }
        expect(withError).to.throwError();
        expect(moduleFake.getValue()).to.be(0);
        expect(moduleFake.getReference()).to.eql({});
    });

    it("should throw an error if something other than a function is passed as the callback", function() {
        var newObj = { hello: "hello" },
            withFunction = moduleFake.__with__({
                myValue: 2,
                myReference: newObj
            });
            callWithFunction = function(){
              var args = arguments;
              return function() {
                withFunction.apply(null, args);
              };
            };

        expect(callWithFunction(1)).to.throwError();
        expect(callWithFunction("a string")).to.throwError();
        expect(callWithFunction({})).to.throwError();
        expect(callWithFunction(function(){})).to.not.throwError();
    });
});
