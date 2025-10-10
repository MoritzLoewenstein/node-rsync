import { describe, expect, it } from "vitest";
import Rsync from "../src/index.js";
import { assertOutput } from "./helpers/output.ts";
import { exposePrivates } from "./test-utils.js";

describe("filters", () => {
	describe("exclude", () => {
		it("should accept single exclude pattern", () => {
			const command = exposePrivates(
				new Rsync({
					source: "SOURCE",
					destination: "DESTINATION",
					exclude: ".git",
				}),
			);
			expect(command._excludes).toHaveLength(1);
		});

		it("should accept exclude patterns as an array", () => {
			const command = exposePrivates(
				new Rsync({
					source: "SOURCE",
					destination: "DESTINATION",
					exclude: [".build", "docs"],
				}),
			);
			expect(command._excludes).toHaveLength(2);
		});

		it("should add exclude patterns to output in order added", () => {
			const command = new Rsync({
				source: "SOURCE",
				destination: "DESTINATION",
				exclude: [".git", "docs", "/tests/*.test.js"],
			});
			assertOutput(
				command,
				"rsync --exclude=.git --exclude=docs --exclude=/tests/*.test.js SOURCE DESTINATION",
			);
		});

		it("should escape filenames", () => {
			const command = new Rsync({
				source: "SOURCE",
				destination: "DESTINATION",
				exclude: ["with space", "tests/* test.js"],
			});
			assertOutput(
				command,
				"rsync --exclude=with\\ space --exclude=tests/*\\ test.js SOURCE DESTINATION",
			);
		});
	});

	describe("include", () => {
		it("should accept single include pattern", () => {
			const command = exposePrivates(
				new Rsync({
					source: "SOURCE",
					destination: "DESTINATION",
					include: ".git",
				}),
			);
			expect(command._includes).toHaveLength(1);
		});

		it("should accept include patterns as an array", () => {
			const command = exposePrivates(
				new Rsync({
					source: "SOURCE",
					destination: "DESTINATION",
					include: [".build", "docs"],
				}),
			);
			expect(command._includes).toHaveLength(2);
		});

		it("should add include patterns to output in order added", () => {
			const command = new Rsync({
				source: "SOURCE",
				destination: "DESTINATION",
				include: [".git", "docs", "/tests/*.test.js"],
			});
			assertOutput(
				command,
				"rsync --include=.git --include=docs --include=/tests/*.test.js SOURCE DESTINATION",
			);
		});
	});

	describe("mixed include/exclude", () => {
		it("should output all excludes then all includes", () => {
			const command = new Rsync({
				source: "SOURCE",
				destination: "DESTINATION",
				exclude: [".git", "build/*"],
				include: ["/tests/*.test.js", "*.md"],
			});
			assertOutput(
				command,
				"rsync --exclude=.git --exclude=build/* --include=/tests/*.test.js --include=*.md SOURCE DESTINATION",
			);
		});
	});
});
