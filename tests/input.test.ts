import { describe, it } from "vitest";
import Rsync from "../src/index.js";
import { assertOutputPattern } from "./helpers/output.ts";

describe("input", () => {
	describe("#source", () => {
		it("should be able to be set as a single String", () => {
			const rsync = new Rsync({
				source: "afile.txt",
				destination: "some_location.txt",
			});
			assertOutputPattern(rsync, /\safile.txt\s/g);
		});

		it("should be able to be set as an Array", () => {
			const rsync = new Rsync({
				source: ["afile.txt", "bfile.txt"],
				destination: "some_location.txt",
			});
			assertOutputPattern(rsync, /\safile.txt bfile.txt\s/g);
		});

		it("should not escape regular filenames", () => {
			const rsync = new Rsync({
				source: ["some_file.txt"],
				destination: "wherever_we_want.txt",
			});
			assertOutputPattern(rsync, /\ssome_file.txt\s/g);
		});

		it("should escape spaced filenames", () => {
			const rsync = new Rsync({
				source: ["some file.txt"],
				destination: "wherever_we_want.txt",
			});
			assertOutputPattern(rsync, /\ssome\\ file.txt\s/g);
		});

		it("should have quote characters escaped", () => {
			const rsync = new Rsync({
				source: ["a_quoted'filename\".txt"],
				destination: "themoon",
			});
			assertOutputPattern(rsync, / a_quoted\\'filename\\".txt /);
		});

		it("should have parentheses escaped", () => {
			const rsync = new Rsync({
				source: ["a (file) with parantheses.txt"],
				destination: "themoon",
			});
			assertOutputPattern(rsync, /a\\ \\\(file\\\)\\ with\\ parantheses.txt/);
		});

		it("should allow mixed filenames", () => {
			const rsync = new Rsync({
				source: ["example file.txt", "manual.pdf", "'special_case 1'.rtf"],
				destination: "somewhere_else/",
			});
			assertOutputPattern(
				rsync,
				/ example\\ file.txt manual.pdf \\'special_case\\ 1\\'.rtf/,
			);
		});
	});

	describe("#destination", () => {
		it("should not have regular filenames escaped", () => {
			const rsync = new Rsync({
				source: ["file1.txt"],
				destination: "the_destination/",
			});
			assertOutputPattern(rsync, /the_destination\/$/);
		});

		it("should have spaced filenames escaped", () => {
			const rsync = new Rsync({
				source: ["file2.txt"],
				destination: "whereever we want.txt",
			});
			assertOutputPattern(rsync, /whereever\\ we\\ want.txt$/);
		});

		it("should have quote characters escaped", () => {
			const rsync = new Rsync({
				source: ["space.txt"],
				destination: "'to infinity and beyond\"/",
			});
			assertOutputPattern(rsync, /\\'to\\ infinity\\ and\\ beyond\\"\/$/);
		});

		it("should have dollar sign characters escaped", () => {
			const rsync = new Rsync({
				source: ["file3.txt"],
				destination: "$some_destination/",
			});
			assertOutputPattern(rsync, /\$some_destination\/$/);
		});
	});
});
