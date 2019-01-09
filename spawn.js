// Credit: Matthew Scragg
// https://github.com/nkashyap/child-process-es6-promise/blob/9c4432f07ade1d954e73ef815b3b72c76a34ece8/index.js#L162-L212

"use strict";

const spawn = require("cross-spawn");

module.exports = (command, args, options) => {
	let child;
	const promise = new Promise((resolve, reject) => {
		child = spawn(command, args, options);
		let stdout, stderr;
		child
			.on("close", (code, signal) => {
				const result = { code, signal, stderr, stdout };
				if (code) reject(Object.assign(new Error(`Exited with code ${ code }`), result));
				else resolve(result);
			})
			.on("error", error => {
				error.stdout = stdout;
				error.stderr = stderr;
				reject(error);
			});
		if (child.stdout) {
			stdout = Buffer.alloc(0);
			child.stdout.on("data", data => { stdout = Buffer.concat([stdout, data]); });
		}
		if (child.stderr) {
			stderr = Buffer.alloc(0);
			child.stderr.on("data", data => { stderr = Buffer.concat([stderr, data]); });
		}
	});
	promise.child = child;
	return promise;
};
