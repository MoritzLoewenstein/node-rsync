import { describe, it } from "vitest";
import Rsync from "../rsync.js";
import { assertOutput, assertOutputPattern } from "./helpers/output.js";

describe("shorthands", () => {
	describe("shell", () => {
		it("should add rsh option", () => {
			const rsync = new Rsync({
				source: "source",
				destination: "destination",
				shell: "ssh",
			});
			assertOutput(rsync, "rsync --rsh=ssh source destination");
		});

		it("should escape options with spaces", () => {
			const rsync = new Rsync({
				source: "source",
				destination: "destination",
				shell: "ssh -i /home/user/.ssh/rsync.key",
			});
			assertOutput(
				rsync,
				'rsync --rsh="ssh -i /home/user/.ssh/rsync.key" source destination',
			);
		});
	});

	describe("chmod", () => {
		it("should allow a simple value", () => {
			const rsync = new Rsync({
				source: "source",
				destination: "destination",
				chmod: "ug=rwx",
			});
			assertOutputPattern(rsync, /chmod=ug=rwx/i);
		});

		it("should allow multiple values", () => {
			const rsync = new Rsync({
				source: "source",
				destination: "destination",
				chmod: ["og=uwx", "rx=ogw"],
			});
			assertOutputPattern(rsync, /chmod=og=uwx --chmod=rx=ogw/);
		});
	});

	describe("delete", () => {
		it("should add the delete option", () => {
			const command = new Rsync({
				source: "SOURCE",
				destination: "DESTINATION",
				delete: true,
			});
			assertOutputPattern(command, /^rsync --delete/);
		});
	});

	describe("progress", () => {
		it("should add the progress option", () => {
			const command = new Rsync({
				source: "SOURCE",
				destination: "DESTINATION",
				progress: true,
			});
			assertOutputPattern(command, /--progress/);
		});
	});

	describe("archive", () => {
		it("should add the archive flag", () => {
			const command = new Rsync({
				source: "SOURCE",
				destination: "DESTINATION",
				archive: true,
			});
			assertOutputPattern(command, /-a/);
		});
	});

	describe("compress", () => {
		it("should add the compress flag", () => {
			const command = new Rsync({
				source: "SOURCE",
				destination: "DESTINATION",
				compress: true,
			});
			assertOutputPattern(command, /-z/);
		});
	});

	describe("recursive", () => {
		it("should add the recursive flag", () => {
			const command = new Rsync({
				source: "SOURCE",
				destination: "DESTINATION",
				recursive: true,
			});
			assertOutputPattern(command, /-r/);
		});
	});

	describe("update", () => {
		it("should add the update flag", () => {
			const command = new Rsync({
				source: "SOURCE",
				destination: "DESTINATION",
				update: true,
			});
			assertOutputPattern(command, /-u/);
		});
	});

	describe("quiet", () => {
		it("should add the quiet flag", () => {
			const command = new Rsync({
				source: "SOURCE",
				destination: "DESTINATION",
				quiet: true,
			});
			assertOutputPattern(command, /-q/);
		});
	});

	describe("dirs", () => {
		it("should add the dirs flag", () => {
			const command = new Rsync({
				source: "SOURCE",
				destination: "DESTINATION",
				dirs: true,
			});
			assertOutputPattern(command, /-d/);
		});
	});

	describe("links", () => {
		it("should add the links flag", () => {
			const command = new Rsync({
				source: "SOURCE",
				destination: "DESTINATION",
				links: true,
			});
			assertOutputPattern(command, /-l/);
		});
	});

	describe("dry", () => {
		it("should add the dry run flag", () => {
			const command = new Rsync({
				source: "SOURCE",
				destination: "DESTINATION",
				dry: true,
			});
			assertOutputPattern(command, /-n/);
		});
	});

	describe("hardLinks", () => {
		it("should add the hard links flag", () => {
			const command = new Rsync({
				source: "SOURCE",
				destination: "DESTINATION",
				hardLinks: true,
			});
			assertOutputPattern(command, /-H/);
		});
	});
});
