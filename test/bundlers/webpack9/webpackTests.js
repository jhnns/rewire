var should = require("chai/lib/chai").should();

describe("__get__ & __set__", function() {

	var moduleA;

	before(function() {
		var rewire = require("rewire");
		moduleA = rewire("../../testModules/moduleA");
	})

	it("should read env", function() {
		var env = moduleA.__get__("env");
		should.exist(env);
		env.should.be.eql("bla");
	});

	it("should read myNumber", function() {
		var myNumber = moduleA.__get__("myNumber");
		should.exist(myNumber);
		myNumber.should.be.eql(0);

		moduleA.setMyNumber(123);

		myNumber = moduleA.__get__("myNumber");
		should.exist(myNumber);
		myNumber.should.be.eql(123);
	});

	it("should read and write myObj", function() {
		var myObj = moduleA.__get__("myObj");
		should.exist(myObj);
		myObj.should.be.a("object");

		var testObject = { test: 123 };
		moduleA.setMyObj(testObject);

		myObj = moduleA.__get__("myObj");
		should.exist(myObj);
		myObj.should.be.equal(testObject);

		var testObject2 = { a: "bc" };
		moduleA.__set__("myObj", testObject2);

		myObj = moduleA.getMyObj();
		should.exist(myObj);
		myObj.should.be.equal(testObject2);
	});

	it("should check some globals", function() {
		moduleA.checkSomeGlobals();
	});
});

describe("rewire module loader", function() {
	it("should return different modules", function() {
		var rewire = require("rewire");
		var mA1 = rewire("../../testModules/moduleA");
		var mA2 = rewire("../../testModules/moduleA");
		mA1.should.be.not.equal(mA2);
	});
});