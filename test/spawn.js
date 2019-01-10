"use strict";

const noop        = require("es5-ext/function/noop")
    , { resolve } = require("path")
    , { assert }  = require("chai")
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

	it("Success exection should fulfill successfully", () => successProgram.then());

	it("Arguments should be passed into process", () =>
		successProgram.then(({ stdoutBuffer }) =>
			assert.deepEqual(JSON.parse(stdoutBuffer).slice(2), ["foo", "--elo", "marko"])
		)
	);

	it("Promise result should expose exit code", () =>
		successProgram.then(({ code }) => assert.equal(code, 0))
	);

	it("Promise result should expose stdout buffer", () =>
		successProgram.then(({ stdoutBuffer }) =>
			assert.deepEqual(JSON.parse(stdoutBuffer).slice(2), ["foo", "--elo", "marko"])
		)
	);

	it("Promise result should expose stderr", () =>
		successProgram.then(({ stderrBuffer }) => assert.equal(String(stderrBuffer), "stderr"))
	);

	it("Errorneous execution should resolve with rejection", () =>
		errorProgram.then(throwUnexpected, noop)
	);

	it("Errorneous execution result should expose exit code", () =>
		errorProgram.then(throwUnexpected, ({ code }) => assert.equal(code, 3))
	);

	it("Errorneous execution result should expose stdout", () =>
		errorProgram.then(throwUnexpected, ({ stdoutBuffer }) =>
			assert.equal(String(stdoutBuffer), "stdout")
		)
	);

	it("Errorneous execution result should expose stderr", () =>
		errorProgram.then(throwUnexpected, ({ stderrBuffer }) =>
			assert.equal(String(stderrBuffer), "stderr")
		)
	);

	it("Invalid program execution should resolve with rejection", () =>
		invalidProgram.then(throwUnexpected, noop)
	);

	it("Invalid program rejection should expose expected eror code", () =>
		invalidProgram.then(throwUnexpected, ({ code }) => assert.equal(code, "ENOENT"))
	);
});
