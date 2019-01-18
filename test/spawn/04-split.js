"use strict";

const { resolve } = require("path")
    , { assert }  = require("chai")
    , spawn       = require("../../spawn");

const playgroundPath = resolve(__dirname, "_playground");

describe("spawn - Split stdout", () => {
	let program;
	const stdoutLines = [], stderrLines = [];
	before(() => {
		program = spawn("./test-bin-split", null, { cwd: playgroundPath, split: true });
		program.stdout.on("data", data => stdoutLines.push(data));
		program.stderr.on("data", data => stderrLines.push(data));
		return program;
	});

	it("Should split stdout", () =>
		assert.deepEqual(stdoutLines, ["firstBLAline", "secondBLAline", "", "fourthBLAline"])
	);

	it("Should split stderr", () => assert.deepEqual(stderrLines, ["one", "two"]));
});
