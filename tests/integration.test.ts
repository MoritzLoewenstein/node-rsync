import { existsSync, mkdirSync, rmSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Rsync from "../src/index.ts";

describe("integration tests", () => {
	const sourceDir = join(process.cwd(), "tests/fixtures/source");
	const destDir = join(process.cwd(), "tests/fixtures/dest");

	beforeEach(() => {
		if (!existsSync(destDir)) {
			mkdirSync(destDir, { recursive: true });
		}
	});

	afterEach(() => {
		if (existsSync(destDir)) {
			rmSync(destDir, { recursive: true, force: true });
		}
	});

	it("should include include.txt and exclude exclude.txt", async () => {
		const rsync = new Rsync({
			source: `${sourceDir}/`,
			destination: destDir,
			flags: "a",
			include: ["include.txt"],
			exclude: ["exclude.txt"],
		});

		await rsync.execute();

		const files = await readdir(destDir);

		expect(files).toContain("include.txt");
		expect(files).not.toContain("exclude.txt");
	});
});
