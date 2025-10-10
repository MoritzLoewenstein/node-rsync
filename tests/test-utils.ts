import type Rsync from "../src/index.js";

export type RsyncInternal = {
	_options: Record<string, string | string[] | null>;
	_sources: string[];
	_destination: string;
	_includes: string[];
	_excludes: string[];
	_cwd: string;
	_env: NodeJS.ProcessEnv;
	_executable: string;
	_executableShell: string;
	command: Rsync["command"];
	executable: Rsync["executable"];
	source: Rsync["source"];
	destination: Rsync["destination"];
	toString: Rsync["toString"];
};

export function exposePrivates(rsync: Rsync): RsyncInternal {
	return rsync as unknown as RsyncInternal;
}
