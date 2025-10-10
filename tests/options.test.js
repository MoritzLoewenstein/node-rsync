import { describe, expect, it } from "vitest";
import Rsync from "../rsync.js";

describe("options", () => {
	describe("constructor", () => {
		it("should accept an empty options object", () => {
			const command = new Rsync();
			expect(typeof command).toBe("object");
		});

		it("should throw an error if options is not an object", () => {
			expect(() => new Rsync("string")).toThrow(/must be an Object/);
			expect(() => new Rsync([])).toThrow(/must be an Object/);
		});

		it("should set flags from string", () => {
			const command = new Rsync({ flags: "avz" });
			expect(command._options).toHaveProperty("a");
			expect(command._options).toHaveProperty("v");
			expect(command._options).toHaveProperty("z");
		});

		it("should set shell option", () => {
			const command = new Rsync({ shell: "ssh" });
			expect(command._options).toHaveProperty("rsh", "ssh");
		});

		it("should set source", () => {
			const command = new Rsync({ source: "/path/to/source" });
			expect(command._sources).toEqual(["/path/to/source"]);
		});

		it("should set multiple sources", () => {
			const command = new Rsync({ source: ["/path/one", "/path/two"] });
			expect(command._sources).toEqual(["/path/one", "/path/two"]);
		});

		it("should set destination", () => {
			const command = new Rsync({ destination: "/path/to/dest" });
			expect(command._destination).toBe("/path/to/dest");
		});

		it("should set delete option", () => {
			const command = new Rsync({ delete: true });
			expect(command._options).toHaveProperty("delete");
		});

		it("should set progress option", () => {
			const command = new Rsync({ progress: true });
			expect(command._options).toHaveProperty("progress");
		});

		it("should set archive option", () => {
			const command = new Rsync({ archive: true });
			expect(command._options).toHaveProperty("a");
		});

		it("should set compress option", () => {
			const command = new Rsync({ compress: true });
			expect(command._options).toHaveProperty("z");
		});

		it("should set recursive option", () => {
			const command = new Rsync({ recursive: true });
			expect(command._options).toHaveProperty("r");
		});

		it("should set custom options via set property", () => {
			const command = new Rsync({ set: { "max-size": "1009", inplace: null } });
			expect(command._options).toHaveProperty("max-size", "1009");
			expect(command._options).toHaveProperty("inplace");
		});
	});

	describe("#executable", () => {
		it("should return the executable", () => {
			const command = new Rsync({ executable: "/usr/local/bin/rsync" });
			expect(command.executable()).toBe("/usr/local/bin/rsync");
		});

		it("should default to rsync", () => {
			const command = new Rsync();
			expect(command.executable()).toBe("rsync");
		});
	});

	describe("#source", () => {
		it("should return the sources array", () => {
			const command = new Rsync({ source: ["/path/one", "/path/two"] });
			expect(command.source()).toEqual(["/path/one", "/path/two"]);
		});
	});

	describe("#destination", () => {
		it("should return the destination", () => {
			const command = new Rsync({ destination: "/path/to/dest" });
			expect(command.destination()).toBe("/path/to/dest");
		});
	});

	describe("#command", () => {
		it("should build a basic command", () => {
			const command = new Rsync({
				source: "/path/to/source",
				destination: "/path/to/dest",
			});
			expect(command.command()).toBe("rsync /path/to/source /path/to/dest");
		});

		it("should build command with flags", () => {
			const command = new Rsync({
				flags: "avz",
				source: "/path/to/source",
				destination: "/path/to/dest",
			});
			expect(command.command()).toBe(
				"rsync -avz /path/to/source /path/to/dest",
			);
		});
	});

	describe("#toString", () => {
		it("should return the command string", () => {
			const command = new Rsync({
				source: "/path/to/source",
				destination: "/path/to/dest",
			});
			expect(command.toString()).toBe(command.command());
		});
	});
});
