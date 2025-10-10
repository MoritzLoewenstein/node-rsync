import { expect } from "vitest";
import type Rsync from "../../src/index.js";

export function assertOutput(
	command: Rsync | (() => Rsync),
	expectation: string | (() => string),
	message?: string,
): void {
	const cmd = isFunction(command) ? command() : command;
	const expected = isFunction(expectation) ? expectation() : expectation;
	const actual = cmd.command();

	if (message) {
		expect(actual, message).toBe(expected);
	} else {
		expect(actual).toBe(expected);
	}
}

export const assertExactOutput: typeof assertOutput = assertOutput;

export function assertOutputPattern(
	command: Rsync | (() => Rsync),
	expectation: RegExp | (() => RegExp),
	message?: string,
): void {
	const cmd = isFunction(command) ? command() : command;
	const expected = isFunction(expectation) ? expectation() : expectation;
	const actual = cmd.command();

	if (message) {
		expect(actual, message).toMatch(expected);
	} else {
		expect(actual).toMatch(expected);
	}
}

function isFunction<T>(input: T | (() => T)): input is () => T {
	return typeof input === "function";
}
