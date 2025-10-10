import { afterAll, beforeAll, describe, it } from "vitest";
import Rsync from "../rsync.js";
import { assertOutputPattern } from "./helpers/output.js";

describe("inputwin32", () => {
	let originalPlatform;

	beforeAll(() => {
		originalPlatform = process.platform;
		Object.defineProperty(process, "platform", {
			value: "win32",
		});
	});

	describe("#sourcewin32", () => {
		it("should convert windows path under windows", () => {
			const rsync = new Rsync({
				source: ["C:\\home\\username\\develop\\readme.txt"],
				destination: "themoon",
			});
			assertOutputPattern(rsync, / \/home\/username\/develop\/readme\.txt /);
		});
	});

	describe("#destinationwin32", () => {
		it("should convert windows path for destination", () => {
			const rsync = new Rsync({
				source: ["reame.txt"],
				destination: "C:\\home\\username\\develop\\",
			});
			assertOutputPattern(rsync, /\/home\/username\/develop\//);
		});
	});

	afterAll(() => {
		Object.defineProperty(process, "platform", {
			value: originalPlatform,
		});
	});
});
