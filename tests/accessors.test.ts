import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import Rsync from "../src/index.js";
import { assertOutput } from "./helpers/output";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("accessors", () => {
	describe("#executable", () => {
		it("should set the executable to use", () => {
			const rsync = new Rsync({
				source: "a.txt",
				destination: "b.txt",
				executable: "/usr/local/bin/rsync",
			});

			expect(rsync.executable()).toBe("/usr/local/bin/rsync");
			assertOutput(rsync, "/usr/local/bin/rsync a.txt b.txt");
		});
	});

	describe("#executableShell", () => {
		it("should set the executable shell to use", () => {
			const rsync = new Rsync({
				source: "a.txt",
				destination: "b.txt",
				executableShell: "/bin/zsh",
			});

			expect(rsync._executableShell).toBe("/bin/zsh");
		});
	});

	describe("#cwd", () => {
		it("should set the cwd to use", () => {
			const rsync = new Rsync({
				source: "a.txt",
				destination: "b.txt",
				cwd: `${__dirname}/..`,
			});

			expect(rsync._cwd).toBe(path.resolve(__dirname, ".."));
		});
	});

	describe("#env", () => {
		it("should set the env variables to use", () => {
			const rsync = new Rsync({
				source: "a.txt",
				destination: "b.txt",
				env: { red: "blue" },
			});

			expect(rsync._env.red).toBe("blue");
		});
	});
});
