import { describe, it } from "vitest";
import Rsync from "../src/index.js";
import { assertOutput } from "./helpers/output.ts";

const testCases = [
	{
		expect:
			"rsync -avz --exclude=no-go.txt --exclude=with\\ space --exclude=.git --exclude=*.tiff path_a/ path_b",
		build: () =>
			new Rsync({
				flags: "avz",
				source: "path_a/",
				destination: "path_b",
				exclude: ["no-go.txt", "with space", ".git", "*.tiff"],
			}),
	},
	{
		expect: 'rsync -rav -f "- .git" test-dir/ test-dir-copy',
		build: () =>
			new Rsync({
				flags: "rav",
				source: "test-dir/",
				destination: "test-dir-copy",
				set: { f: "- .git" },
			}),
	},
];

describe("output tests", () => {
	testCases.forEach(function buildTestCase(testCase, index) {
		const message = `passes case ${index + 1}`;
		it(message, () => {
			assertOutput(testCase.build(), testCase.expect);
		});
	});
});
