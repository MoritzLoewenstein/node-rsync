import { spawn } from "node:child_process";
import path from "node:path";

/**
 * Rsync is a wrapper class to configure and execute an `rsync` command.
 *
 * @example
 *   const rsync = new Rsync({
 *     source: '/path/to/source',
 *     destination: 'myserver:destination/',
 *     flags: 'avz',
 *     shell: 'ssh'
 *   });
 *
 *   rsync.execute((error, code, cmd) => {
 *     // function called when the child process is finished
 *   });
 */
class Rsync {
	constructor(options = {}) {
		if (typeof options !== "object" || Array.isArray(options)) {
			throw new Error("Rsync options must be an Object");
		}

		this._executable = options.executable || "rsync";
		this._executableShell = options.executableShell || "/bin/sh";
		this._sources = [];
		this._destination = "";
		this._includes = [];
		this._excludes = [];
		this._options = {};
		this._outputHandlers = {
			stdout: null,
			stderr: null,
		};
		this._cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();
		this._env = options.env || process.env;
		this._debug = options.debug || false;

		this._processOptions(options);
	}

	_processOptions(options) {
		if (options.source) {
			if (Array.isArray(options.source)) {
				this._sources = [...options.source];
			} else {
				this._sources = [options.source];
			}
		}

		if (options.destination) {
			this._destination = options.destination;
		}

		if (options.flags) {
			const flags = options.flags.split("");
			flags.forEach((flag) => {
				this._options[flag] = null;
			});
		}

		if (options.shell) {
			this._options.rsh = options.shell;
		}

		if (options.delete) {
			this._options.delete = null;
		}

		if (options.progress) {
			this._options.progress = null;
		}

		if (options.archive || options.a) {
			this._options.a = null;
		}

		if (options.compress || options.z) {
			this._options.z = null;
		}

		if (options.recursive || options.r) {
			this._options.r = null;
		}

		if (options.update || options.u) {
			this._options.u = null;
		}

		if (options.quiet || options.q) {
			this._options.q = null;
		}

		if (options.dirs || options.d) {
			this._options.d = null;
		}

		if (options.links || options.l) {
			this._options.l = null;
		}

		if (options.dry || options.n) {
			this._options.n = null;
		}

		if (options.hardLinks || options.H) {
			this._options.H = null;
		}

		if (options.perms || options.p) {
			this._options.p = null;
		}

		if (options.executability || options.E) {
			this._options.E = null;
		}

		if (options.group || options.g) {
			this._options.g = null;
		}

		if (options.owner || options.o) {
			this._options.o = null;
		}

		if (options.acls || options.A) {
			this._options.A = null;
		}

		if (options.xattrs || options.X) {
			this._options.X = null;
		}

		if (options.devices) {
			this._options.devices = null;
		}

		if (options.specials) {
			this._options.specials = null;
		}

		if (options.times || options.t) {
			this._options.t = null;
		}

		if (options.chmod) {
			if (Array.isArray(options.chmod)) {
				this._options.chmod = options.chmod;
			} else {
				this._options.chmod = [options.chmod];
			}
		}

		if (options.exclude) {
			const excludes = Array.isArray(options.exclude)
				? options.exclude
				: [options.exclude];
			this._excludes.push(...excludes);
		}

		if (options.include) {
			const includes = Array.isArray(options.include)
				? options.include
				: [options.include];
			this._includes.push(...includes);
		}

		if (options.output) {
			if (Array.isArray(options.output)) {
				if (typeof options.output[0] === "function") {
					this._outputHandlers.stdout = options.output[0];
				}
				if (typeof options.output[1] === "function") {
					this._outputHandlers.stderr = options.output[1];
				}
			}
		}

		if (options.set) {
			for (const [key, value] of Object.entries(options.set)) {
				this._options[key] = value;
			}
		}
	}

	/**
	 * Get the command that is going to be executed.
	 * @return {String}
	 */
	command() {
		return `${this.executable()} ${this.args().join(" ")}`;
	}

	/**
	 * String representation of the Rsync command.
	 * @return {String}
	 */
	toString() {
		return this.command();
	}

	/**
	 * Get the executable.
	 * @return {String}
	 */
	executable() {
		return this._executable;
	}

	/**
	 * Get the source(s).
	 * @return {Array}
	 */
	source() {
		return this._sources;
	}

	/**
	 * Get the destination.
	 * @return {String}
	 */
	destination() {
		return this._destination;
	}

	/**
	 * Get the arguments for the rsync command.
	 * @return {Array}
	 */
	args() {
		const args = [];
		const short = [];
		const long = [];

		for (const [key, value] of Object.entries(this._options)) {
			const noval = value === null || value === undefined;

			if (key.length === 1 && noval) {
				short.push(key);
			} else {
				if (Array.isArray(value)) {
					value.forEach((val) => {
						long.push(buildOption(key, val, escapeShellArg));
					});
				} else {
					long.push(buildOption(key, value, escapeShellArg));
				}
			}
		}

		if (short.length > 0) {
			args.push(`-${short.join("")}`);
		}

		if (long.length > 0) {
			args.push(...long);
		}

		this._excludes.forEach((pattern) => {
			args.push(buildOption("exclude", pattern, escapeFileArg));
		});

		this._includes.forEach((pattern) => {
			args.push(buildOption("include", pattern, escapeFileArg));
		});

		if (this._sources.length > 0) {
			args.push(...this._sources.map(escapeFileArg));
		}

		if (this._destination) {
			args.push(escapeFileArg(this._destination));
		}

		return args;
	}

	/**
	 * Execute the rsync command.
	 *
	 * @param {Function} stdoutHandler Called on each chunk received from stdout (optional)
	 * @param {Function} stderrHandler Called on each chunk received from stderr (optional)
	 * @return {Promise<{code: number, cmd: string}>}
	 */
	execute(stdoutHandler, stderrHandler) {
		if (typeof stdoutHandler === "function") {
			this._outputHandlers.stdout = stdoutHandler;
		}
		if (typeof stderrHandler === "function") {
			this._outputHandlers.stderr = stderrHandler;
		}

		return new Promise((resolve, reject) => {
			let cmdProc;
			if (process.platform === "win32") {
				cmdProc = spawn("cmd.exe", ["/s", "/c", `"${this.command()}"`], {
					stdio: "pipe",
					windowsVerbatimArguments: true,
					cwd: this._cwd,
					env: this._env,
				});
			} else {
				cmdProc = spawn(this._executableShell, ["-c", this.command()], {
					stdio: "pipe",
					cwd: this._cwd,
					env: this._env,
				});
			}

			if (typeof this._outputHandlers.stdout === "function") {
				cmdProc.stdout.on("data", this._outputHandlers.stdout);
			}
			if (typeof this._outputHandlers.stderr === "function") {
				cmdProc.stderr.on("data", this._outputHandlers.stderr);
			}

			cmdProc.on("close", (code) => {
				if (code !== 0) {
					const error = new Error(`rsync exited with code ${code}`);
					error.code = code;
					error.cmd = this.command();
					reject(error);
				} else {
					resolve({ code, cmd: this.command() });
				}
			});

			cmdProc.on("error", (error) => {
				reject(error);
			});
		});
	}
}

export default Rsync;

function buildOption(name, value, escapeArg) {
	const single = name.length === 1;
	const prefix = single ? "-" : "--";
	const glue = single ? " " : "=";

	let option = prefix + name;
	if (value) {
		value = escapeArg(String(value));
		option += glue + value;
	}

	return option;
}

function escapeShellArg(arg) {
	if (!/(["'`\\$ ])/.test(arg)) {
		return arg;
	}
	return `"${arg.replace(/(["'`\\$])/g, "\\$1")}"`;
}

function escapeFileArg(filename) {
	filename = filename.replace(/(["'`\s\\()\\$])/g, "\\$1");
	if (!/(\\\\)/.test(filename)) {
		return filename;
	}

	if (process.platform === "win32") {
		filename = filename.replace(/\\\\/g, "/").replace(/^["]?[A-Z]:\//gi, "/");
	}
	return filename;
}
