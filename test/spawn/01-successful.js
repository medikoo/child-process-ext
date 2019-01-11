"use strict";

const noop        = require("es5-ext/function/noop")
    , { resolve } = require("path")
    , { assert }  = require("chai")
    , spawn       = require("../../spawn");

const playgroundPath = resolve(__dirname, "_playground");

describe("spawn - Successful execution", () => {
	let program;
	before(
		() =>
			(program = spawn("./test-bin-success.js", ["foo", "--elo", "marko"], {
				cwd: playgroundPath
			}))
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
