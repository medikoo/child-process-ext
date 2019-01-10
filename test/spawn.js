"use strict";

const noop        = require("es5-ext/function/noop")
    , { resolve } = require("path")
    , { assert }  = require("chai")
    , spawn       = require("../spawn");

const playgroundPath = resolve(__dirname, "_playground");

const throwUnexpected = () => { throw new Error("Unexpected"); };

describe("spawn", () => {
	describe("Successful execution", () => {
		let program;
		before(() =>
			(program = spawn("./test-bin-success.js", ["foo", "--elo", "marko"], {
				cwd: playgroundPath
			})).catch(noop)
		);

		it("Should fulfill successfully", () => program.then());

		it("Arguments should be passed into process", () =>
			program.then(({ stdoutBuffer }) =>
				assert.deepEqual(JSON.parse(stdoutBuffer).slice(2), ["foo", "--elo", "marko"])
			)
		);

		it("Promise result should expose exit code", () =>
			program.then(({ code }) => assert.equal(code, 0))
		);

		it("Promise result should expose stdout buffer", () =>
			program.then(({ stdoutBuffer }) =>
				assert.deepEqual(JSON.parse(stdoutBuffer).slice(2), ["foo", "--elo", "marko"])
			)
		);

		it("Promise result should expose stderr", () =>
			program.then(({ stderrBuffer }) => assert.equal(String(stderrBuffer), "stderr"))
		);
	});

	describe("Errorneous execution", () => {
		let program;
		before(() =>
			(program = spawn("./test-bin-error.js", ["umpa", "--elo", "marko"], {
				cwd: playgroundPath
			})).catch(noop)
		);

		it("Errorneous execution should resolve with rejection", () =>
			program.then(throwUnexpected, noop)
		);

		it("Errorneous execution result should expose exit code", () =>
			program.then(throwUnexpected, ({ code }) => assert.equal(code, 3))
		);

		it("Errorneous execution result should expose stdout", () =>
			program.then(throwUnexpected, ({ stdoutBuffer }) =>
				assert.equal(String(stdoutBuffer), "stdout")
			)
		);

		it("Errorneous execution result should expose stderr", () =>
			program.then(throwUnexpected, ({ stderrBuffer }) =>
				assert.equal(String(stderrBuffer), "stderr")
			)
		);
	});

	describe("Invalid execution", () => {
		let program;
		before(() =>
			(program = spawn("./test-bin-non-existing.js", ["umpa", "--elo", "marko"], {
				cwd: playgroundPath
			})).catch(noop)
		);
		it("Invalid program execution should resolve with rejection", () =>
			program.then(throwUnexpected, noop)
		);

		it("Invalid program rejection should expose expected eror code", () =>
			program.then(throwUnexpected, ({ code }) => assert.equal(code, "ENOENT"))
		);
	});
});
