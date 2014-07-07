var expect = require("expect.js"),
    setModule = require("../lib/__set__.js")
    __set__ = setModule["__set__"],
    __with__ = setModule["__with__"],
    vm = require("vm"),

    expectReferenceError = expectError(ReferenceError),
    expectTypeError = expectError(TypeError);

function expectError(ErrConstructor) {
    return function expectReferenceError(err) {
        expect(err.constructor.name).to.be(ErrConstructor.name);
    };
}

describe("__set__", function () {
    var moduleFake;

    beforeEach(function () {
        moduleFake = {
            myValue: 0,    // copy by value
            myReference: {}       // copy by reference
        };

        vm.runInNewContext(
            "__set__ = " + __set__.toString() + "; " +
            "getValue = function () { return myValue; }; " +
            "getReference = function () { return myReference; }; ",
            moduleFake
        );
    });
    it("should set the new value when calling with varName, varValue", function () {
        expect(moduleFake.getValue()).to.be(0);
        moduleFake.__set__("myValue", undefined);
        expect(moduleFake.getValue()).to.be(undefined);
        moduleFake.__set__("myValue", null);
        expect(moduleFake.getValue()).to.be(null);
        moduleFake.__set__("myValue", 2);
        expect(moduleFake.getValue()).to.be(2);
        moduleFake.__set__("myValue", "hello");
        expect(moduleFake.getValue()).to.be("hello");
    });
    it("should set the new reference when calling with varName, varValue", function () {
        var newObj = { hello: "hello" },
            newArr = [1, 2, 3],
            regExp = /123/gi;

        function newFn() {
            console.log("hello");
        }

        expect(moduleFake.getReference()).to.eql({});
        moduleFake.__set__("myReference", newObj);
        expect(moduleFake.getReference()).to.be(newObj);
        moduleFake.__set__("myReference", newArr);
        expect(moduleFake.getReference()).to.be(newArr);
        moduleFake.__set__("myReference", newFn);
        expect(moduleFake.getReference()).to.be(newFn);
        moduleFake.__set__("myReference", regExp);
        expect(moduleFake.getReference()).to.be(regExp);
    });
    it("should set the new number and the new obj when calling with an env-obj", function () {
        var newObj = { hello: "hello" };

        expect(moduleFake.getValue()).to.be(0);
        expect(moduleFake.getReference()).to.eql({});
        moduleFake.__set__({
            myValue: 2,
            myReference: newObj
        });
        expect(moduleFake.getValue()).to.be(2);
        expect(moduleFake.getReference()).to.be(newObj);
    });
    it("should return a function that when invoked reverts to the values before set was called", function () {
        undo = moduleFake.__set__("myValue", 4)
        expect(typeof undo).to.be("function");
        expect(moduleFake.getValue()).to.be(4);
        undo()
        expect(moduleFake.getValue()).to.be(0);
    });
    it("should be able to revert when calling with an env-obj", function () {
        var newObj = { hello: "hello" };

        expect(moduleFake.getValue()).to.be(0);
        expect(moduleFake.getReference()).to.eql({});

        var undo = moduleFake.__set__({
            myValue: 2,
            myReference: newObj
        });

        expect(moduleFake.getValue()).to.be(2);
        expect(moduleFake.getReference()).to.be(newObj);

        undo();

        expect(moduleFake.getValue()).to.be(0);
        expect(moduleFake.getReference()).to.eql({});
    });
    it("should throw a TypeError when passing misfitting params", function () {
        expect(function () {
            moduleFake.__set__();
        }).to.throwException(expectTypeError);
        expect(function () {
            moduleFake.__set__(undefined);
        }).to.throwException(expectTypeError);
        expect(function () {
            moduleFake.__set__(null);
        }).to.throwException(expectTypeError);
        expect(function () {
            moduleFake.__set__(true);
        }).to.throwException(expectTypeError);
        expect(function () {
            moduleFake.__set__(2);
        }).to.throwException(expectTypeError);
        expect(function () {
            moduleFake.__set__("");
        }).to.throwException(expectTypeError);
        expect(function () {
            moduleFake.__set__(function () {});
        }).to.throwException(expectTypeError);
        expect(function () {
            moduleFake.__set__({}, true);   // misfitting number of params
        }).to.throwException(expectTypeError);
        expect(function () {
            moduleFake.__set__("someVar");  // misfitting number of params
        }).to.throwException(expectTypeError);
    });
});

describe("__with__", function() {
    var moduleFake;

    beforeEach(function () {
        moduleFake = {
            myValue: 0,    // copy by value
            myReference: {}       // copy by reference
        };

        //__with__ requires __set__ to be in scope
        vm.runInNewContext(
            "__set__ = " + __set__.toString() + "; " +
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
        })

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
          })
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
            })
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
