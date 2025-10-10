/*
 * A simple example that builds and executes the following command:
 *
 *     rsync -avz --rsh 'ssh' /path/to/source you@server:/destination/path
 *
 * The `execute` method returns a Promise that resolves with the exit code
 * and executed command string.
 */

import Rsync from "../rsync.js";

const cmd = new Rsync({
	flags: "avz",
	shell: "ssh",
	source: "/path/to/source",
	destination: "you@server:/destination/path",
});

try {
	const result = await cmd.execute();
	console.log("All done executing", result.cmd);
} catch (error) {
	console.error("Error executing rsync:", error.message);
}

const cmd2 = new Rsync({
	flags: "avz",
	shell: "ssh",
	source: "/path/to/source",
	destination: "you@server:/destination/path",
	exclude: ["*.tmp", "*.log"],
	delete: true,
	progress: true,
});

cmd2
	.execute()
	.then((result) => {
		console.log("All done executing", result.cmd);
	})
	.catch((error) => {
		console.error("Error:", error.message);
	});
