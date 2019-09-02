// Credit: Matthew Scragg
// https://github.com/nkashyap/child-process-es6-promise/blob/9c4432f07ade1d954e73ef815b3b72c76a34ece8/index.js#L162-L212

"use strict";

const ensureString    = require("es5-ext/object/validate-stringifiable-value")
    , isValue         = require("es5-ext/object/is-value")
    , isObject        = require("es5-ext/object/is-object")
    , ensureObject    = require("es5-ext/object/valid-object")
    , log             = require("log").get("child-process-ext:spawn")
    , { PassThrough } = require("stream")
    , spawn           = require("cross-spawn")
    , split           = require("split2")
    , streamPromise   = require("stream-promise");

const stdOutLog = log.get("std:out"), stdErrLog = log.get("std:err");

let processCounter = 0;

module.exports = (command, args = [], options = {}) => {
	let child, std, stdout, stderr, stdoutBuffer, stderrBuffer, stdBuffer;
	const resolveListeners = [], processIndex = ++processCounter;

	const promise = new Promise((resolve, reject) => {
		command = ensureString(command);
		if (isValue(args)) args = Array.from(ensureObject(args), ensureString);
		if (!isObject(options)) options = {};
		log.debug("[%d] run %s with %o", processIndex, command, args);

		child = spawn(command, args, options)
			.on("close", (code, signal) => {
				const result = { code, signal, stdoutBuffer, stderrBuffer, stdBuffer };
				for (const listener of resolveListeners) listener();
				if (code) {
					log.debug("[%d] failed with %d", processIndex, code);
					reject(
						Object.assign(
							new Error(
								`\`${ command } ${ args.join(" ") }\` Exited with code ${ code }`
							),
							result
						)
					);
				} else {
					log.debug("[%d] succeeded", processIndex);
					resolve(result);
				}
			})
			.on("error", error => {
				for (const listener of resolveListeners) listener();
				log.debug("[%d] errored with %o", processIndex, error);
				reject(Object.assign(error, { stdoutBuffer, stderrBuffer }));
			});

		if (child.stdout) {
			({ stdout } = child);
			if (options.split) stdout = stdout.pipe(split());
			stdoutBuffer = Buffer.alloc(0);
			std = child.stdout.pipe(new PassThrough());
			stdBuffer = Buffer.alloc(0);
			child.stdout.on("data", data => {
				stdOutLog.debug("[%d] %s", processIndex, data);
				promise.stdoutBuffer = stdoutBuffer = Buffer.concat([stdoutBuffer, data]);
				promise.stdBuffer = stdBuffer = Buffer.concat([stdBuffer, data]);
			});
		} else if (stdOutLog.debug.isEnabled) {
			stdOutLog.warn(
				"[%d] cannot expose %s output, as it's not exposed on a spawned process",
				processIndex, "stdout"
			);
		}
		if (child.stderr) {
			({ stderr } = child);
			if (options.split) stderr = stderr.pipe(split());
			stderrBuffer = Buffer.alloc(0);
			child.stderr.pipe(std);
			child.stderr.on("data", data => {
				stdErrLog.debug("[%d] %s", processIndex, data);
				promise.stderrBuffer = stderrBuffer = Buffer.concat([stderrBuffer, data]);
				promise.stdBuffer = stdBuffer = Buffer.concat([stdBuffer, data]);
			});
		} else if (stdErrLog.debug.isEnabled) {
			stdErrLog.warn(
				"[%d] cannot expose %s output, as it's not exposed on a spawned process",
				processIndex, "stderr"
			);
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
