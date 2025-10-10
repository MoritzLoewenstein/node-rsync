import { type ChildProcess, spawn } from "node:child_process";
import path from "node:path";

/**
 * @exports
 * @link https://linux.die.net/man/1/rsync
 */
export interface RsyncOptions {
	/** Source path(s) to sync from */
	source?: string | string[];
	/** Destination path to sync to */
	destination?: string;
	/** Path to rsync executable (default: 'rsync') */
	executable?: string;
	/** Shell to use for launching rsync on Unix systems (default: '/bin/sh') */
	executableShell?: string;
	/** Working directory for the rsync process */
	cwd?: string;
	/** Environment variables for the rsync process */
	env?: NodeJS.ProcessEnv;
	/** Single letter flags as a string (e.g., 'avz') or array (e.g., ['a', 'v', 'z']) */
	flags?: string | string[];
	/** Remote shell to use (sets --rsh option) */
	shell?: string;
	/** Delete extraneous files from destination (--delete) */
	delete?: boolean;
	/** Show progress during transfer (--progress) */
	progress?: boolean;
	/** Archive mode (-a) - equals -rlptgoD */
	archive?: boolean;
	/** Compress file data during transfer (-z) */
	compress?: boolean;
	/** Recurse into directories (-r) */
	recursive?: boolean;
	/** Skip files that are newer on receiver (-u) */
	update?: boolean;
	/** Suppress non-error messages (-q) */
	quiet?: boolean;
	/** Transfer directories without recursing (-d) */
	dirs?: boolean;
	/** Copy symlinks as symlinks (-l) */
	links?: boolean;
	/** Perform a trial run with no changes made (-n) */
	dry?: boolean;
	/** Preserve hard links (-H) */
	hardLinks?: boolean;
	/** Preserve permissions (-p) */
	perms?: boolean;
	/** Preserve executability (-E) */
	executability?: boolean;
	/** Preserve group (-g) */
	group?: boolean;
	/** Preserve owner (-o) */
	owner?: boolean;
	/** Preserve ACLs (-A) */
	acls?: boolean;
	/** Preserve extended attributes (-X) */
	xattrs?: boolean;
	/** Preserve device files (--devices) */
	devices?: boolean;
	/** Preserve special files (--specials) */
	specials?: boolean;
	/** Preserve modification times (-t) */
	times?: boolean;
	/** Set file/directory permissions (--chmod) */
	chmod?: string | string[];
	/** Exclude files matching pattern(s) */
	exclude?: string | string[];
	/** Include files matching pattern(s) */
	include?: string | string[];
	/** Output handlers for stdout and stderr */
	output?: [(data: Buffer) => void, (data: Buffer) => void];
	/** Custom rsync options as key-value pairs */
	set?: Record<string, string | null>;
}

export interface RsyncResult {
	code: number;
	cmd: string;
}

export interface RsyncError extends Error {
	code: number;
	cmd: string;
}

type OutputHandler = (data: Buffer) => void;

class Rsync {
	private _executable: string;
	private _executableShell: string;
	private _sources: string[];
	private _destination: string;
	private _includes: string[];
	private _excludes: string[];
	private _options: Record<string, string | string[] | null>;
	private _outputHandlers: {
		stdout: OutputHandler | null;
		stderr: OutputHandler | null;
	};
	private _cwd: string;
	private _env: NodeJS.ProcessEnv;

	constructor(options: RsyncOptions = {}) {
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

		this._processOptions(options);
	}

	private _processOptions(options: RsyncOptions): void {
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
			const flags = Array.isArray(options.flags)
				? options.flags
				: options.flags.split("");
			for (const flag of flags) {
				this._options[flag] = null;
			}
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

		if (options.archive) {
			this._options.a = null;
		}

		if (options.compress) {
			this._options.z = null;
		}

		if (options.recursive) {
			this._options.r = null;
		}

		if (options.update) {
			this._options.u = null;
		}

		if (options.quiet) {
			this._options.q = null;
		}

		if (options.dirs) {
			this._options.d = null;
		}

		if (options.links) {
			this._options.l = null;
		}

		if (options.dry) {
			this._options.n = null;
		}

		if (options.hardLinks) {
			this._options.H = null;
		}

		if (options.perms) {
			this._options.p = null;
		}

		if (options.executability) {
			this._options.E = null;
		}

		if (options.group) {
			this._options.g = null;
		}

		if (options.owner) {
			this._options.o = null;
		}

		if (options.acls) {
			this._options.A = null;
		}

		if (options.xattrs) {
			this._options.X = null;
		}

		if (options.devices) {
			this._options.devices = null;
		}

		if (options.specials) {
			this._options.specials = null;
		}

		if (options.times) {
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

	command(): string {
		return `${this.executable()} ${this.args().join(" ")}`;
	}

	toString(): string {
		return this.command();
	}

	executable(): string {
		return this._executable;
	}

	source(): string[] {
		return this._sources;
	}

	destination(): string {
		return this._destination;
	}

	args(): string[] {
		const args: string[] = [];
		const short: string[] = [];
		const long: string[] = [];

		for (const [key, value] of Object.entries(this._options)) {
			const noval = value === null || value === undefined;

			if (key.length === 1 && noval) {
				short.push(key);
			} else {
				if (Array.isArray(value)) {
					for (const val of value) {
						long.push(buildOption(key, val, escapeShellArg));
					}
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

		for (const pattern of this._excludes) {
			args.push(buildOption("exclude", pattern, escapeFileArg));
		}

		for (const pattern of this._includes) {
			args.push(buildOption("include", pattern, escapeFileArg));
		}

		if (this._sources.length > 0) {
			args.push(...this._sources.map(escapeFileArg));
		}

		if (this._destination) {
			args.push(escapeFileArg(this._destination));
		}

		return args;
	}

	execute(
		stdoutHandler?: OutputHandler,
		stderrHandler?: OutputHandler,
	): Promise<RsyncResult> {
		if (typeof stdoutHandler === "function") {
			this._outputHandlers.stdout = stdoutHandler;
		}
		if (typeof stderrHandler === "function") {
			this._outputHandlers.stderr = stderrHandler;
		}

		return new Promise((resolve, reject) => {
			let cmdProc: ChildProcess;
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
				cmdProc.stdout?.on("data", this._outputHandlers.stdout);
			}
			if (typeof this._outputHandlers.stderr === "function") {
				cmdProc.stderr?.on("data", this._outputHandlers.stderr);
			}

			cmdProc.on("close", (code) => {
				if (code !== 0) {
					const error = new Error(
						`rsync exited with code ${code}`,
					) as RsyncError;
					error.code = code ?? -1;
					error.cmd = this.command();
					reject(error);
				} else {
					resolve({ code: code ?? 0, cmd: this.command() });
				}
			});

			cmdProc.on("error", (error) => {
				reject(error);
			});
		});
	}
}

export default Rsync;

type EscapeFunction = (value: string) => string;

function buildOption(
	name: string,
	value: string | null,
	escapeArg: EscapeFunction,
): string {
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

function escapeShellArg(arg: string): string {
	if (!/(["'`\\$ ])/.test(arg)) {
		return arg;
	}
	return `"${arg.replace(/(["'`\\$])/g, "\\$1")}"`;
}

function escapeFileArg(filename: string): string {
	filename = filename.replace(/(["'`\s\\()\\$])/g, "\\$1");
	if (!/(\\\\)/.test(filename)) {
		return filename;
	}

	if (process.platform === "win32") {
		filename = filename.replace(/\\\\/g, "/").replace(/^["]?[A-Z]:\//gi, "/");
	}
	return filename;
}
