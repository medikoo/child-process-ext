// Credit: Matthew Scragg
// https://github.com/nkashyap/child-process-es6-promise/blob/9c4432f07ade1d954e73ef815b3b72c76a34ece8/index.js#L162-L212

"use strict";

const ensureString = require("es5-ext/object/validate-stringifiable-value")
    , isValue      = require("es5-ext/object/is-value")
    , isObject     = require("es5-ext/object/is-object")
    , ensureObject = require("es5-ext/object/valid-object")
    , spawn        = require("cross-spawn");

module.exports = (command, args = [], options = {}) => {
	let child;

	const promise = new Promise((resolve, reject) => {
		command = ensureString(command);
		if (isValue(args)) args = Array.from(ensureObject(args), ensureString);
		if (!isObject(options)) options = {};
		child = spawn(command, args, options);
		let stdoutBuffer, stderrBuffer;
		child
			.on("close", (code, signal) => {
				const result = { code, signal, stderr: stderrBuffer, stdout: stdoutBuffer };
				if (code) reject(Object.assign(new Error(`Exited with code ${ code }`), result));
				else resolve(result);
			})
			.on("error", error => {
				error.stdout = stdoutBuffer;
				error.stderr = stderrBuffer;
				reject(error);
			});
		if (child.stdout) {
			stdoutBuffer = Buffer.alloc(0);
			child.stdout.on("data", data => {
				stdoutBuffer = Buffer.concat([stdoutBuffer, data]);
			});
		}
		if (child.stderr) {
			stderrBuffer = Buffer.alloc(0);
			child.stderr.on("data", data => {
				stderrBuffer = Buffer.concat([stderrBuffer, data]);
			});
		}
	});
	promise.child = child;
	return promise;
};
