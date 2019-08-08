// Credit: Matthew Scragg
// https://github.com/nkashyap/child-process-es6-promise/blob/9c4432f07ade1d954e73ef815b3b72c76a34ece8/index.js#L162-L212

"use strict";

const ensureString    = require("es5-ext/object/validate-stringifiable-value")
    , isValue         = require("es5-ext/object/is-value")
    , isObject        = require("es5-ext/object/is-object")
    , ensureObject    = require("es5-ext/object/valid-object")
    , { PassThrough } = require("stream")
    , spawn           = require("cross-spawn")
    , split           = require("split2")
    , streamPromise   = require("stream-promise");

module.exports = (command, args = [], options = {}) => {
	let child, std, stdout, stderr, stdoutBuffer, stderrBuffer, stdBuffer;
	const resolveListeners = [];

	const promise = new Promise((resolve, reject) => {
		command = ensureString(command);
		if (isValue(args)) args = Array.from(ensureObject(args), ensureString);
		if (!isObject(options)) options = {};

		child = spawn(command, args, options)
			.on("close", (code, signal) => {
				const result = { code, signal, stdoutBuffer, stderrBuffer, stdBuffer };
				for (const listener of resolveListeners) listener();
				if (code) {
					reject(
						Object.assign(
							new Error(
								`\`${ command } ${ args.join(" ") }\` Exited with code ${ code }`
							),
							result
						)
					);
				} else resolve(result);
			})
			.on("error", error => {
				for (const listener of resolveListeners) listener();
				reject(Object.assign(error, { stdoutBuffer, stderrBuffer }));
			});

		if (child.stdout) {
			({ stdout } = child);
			if (options.split) stdout = stdout.pipe(split());
			stdoutBuffer = Buffer.alloc(0);
			std = child.stdout.pipe(new PassThrough());
			stdBuffer = Buffer.alloc(0);
			child.stdout.on("data", data => {
				promise.stdoutBuffer = stdoutBuffer = Buffer.concat([stdoutBuffer, data]);
				promise.stdBuffer = stdBuffer = Buffer.concat([stdBuffer, data]);
			});
		}
		if (child.stderr) {
			({ stderr } = child);
			if (options.split) stderr = stderr.pipe(split());
			stderrBuffer = Buffer.alloc(0);
			child.stderr.pipe(std);
			child.stderr.on("data", data => {
				promise.stderrBuffer = stderrBuffer = Buffer.concat([stderrBuffer, data]);
				promise.stdBuffer = stdBuffer = Buffer.concat([stdBuffer, data]);
			});
		}
	});
	if (stdout) {
		streamPromise(
			stdout, new Promise(resolve => resolveListeners.push(() => resolve(stdoutBuffer)))
		);
		streamPromise(std, new Promise(resolve => resolveListeners.push(() => resolve(stdBuffer))));
	}
	if (stderr) {
		streamPromise(
			stderr, new Promise(resolve => resolveListeners.push(() => resolve(stderrBuffer)))
		);
	}
	return Object.assign(promise, {
		child,
		std,
		stdout,
		stderr,
		stdoutBuffer,
		stderrBuffer,
		stdBuffer
	});
};
