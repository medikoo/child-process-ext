"use strict";

const noop        = require("es5-ext/function/noop")
    , { resolve } = require("path")
    , { assert }  = require("chai").use(require("chai-as-promised"))
    , spawn       = require("../spawn");

const playgroundPath = resolve(__dirname, "_playground");

const throwUnexpected = () => { throw new Error("Unexpected"); };

describe("spawn", () => {
	let successProgram, errorProgram, invalidProgram;
	before(() => {
		successProgram = spawn("./test-bin-success.js", ["foo", "--elo", "marko"], {
			cwd: playgroundPath
		});
		errorProgram = spawn("./test-bin-error.js", ["umpa", "--elo", "marko"], {
			cwd: playgroundPath
		});
		invalidProgram = spawn("./test-bin-non-existing.js", ["umpa", "--elo", "marko"], {
			cwd: playgroundPath
		});
		return Promise.all([
			successProgram.catch(noop), errorProgram.catch(noop), invalidProgram.catch(noop)
		]);
	});

	it("Success exection should fulfill successfully", () => assert.isFulfilled(successProgram));

	it("Arguments should be passed into process", () =>
		successProgram.then(({ stdout }) =>
			assert.deepEqual(JSON.parse(stdout).slice(2), ["foo", "--elo", "marko"])
		)
	);

	it("Promise result should expose exit code", () =>
		successProgram.then(({ code }) => assert.equal(code, 0))
	);

	it("Promise result should expose stdout", () =>
		successProgram.then(({ stdout }) =>
			assert.deepEqual(JSON.parse(stdout).slice(2), ["foo", "--elo", "marko"])
		)
	);

	it("Promise result should expose stderr", () =>
		successProgram.then(({ stderr }) => assert.equal(String(stderr), "stderr"))
	);

	it("Errorneous execution should resolve with rejection", () => assert.isRejected(errorProgram));

	it("Errorneous execution result should expose exit code", () =>
		errorProgram.then(throwUnexpected, ({ code }) => assert.equal(code, 3))
	);

	it("Errorneous execution result should expose stdout", () =>
		errorProgram.then(throwUnexpected, ({ stdout }) => assert.equal(String(stdout), "stdout"))
	);

	it("Errorneous execution result should expose stderr", () =>
		errorProgram.then(throwUnexpected, ({ stderr }) => assert.equal(String(stderr), "stderr"))
	);

	it("Invalid program execution should resolve with rejection", () =>
		assert.isRejected(invalidProgram)
	);

	it("Invalid program rejection should expose expected eror code", () =>
		invalidProgram.then(throwUnexpected, ({ code }) => assert.equal(code, "ENOENT"))
	);
});
