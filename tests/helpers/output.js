import { expect } from "vitest";

/**
 * Assert the exact output of a command against an expectation.
 *
 * @param {Rsync|Function} command
 * @param {String|Function} expectation
 * @param {String} message
 */
export function assertOutput(command, expectation, message) {
	command = isFunction(command) ? command() : command;
	expectation = isFunction(expectation) ? expectation() : expectation;
	const actual = command.command();

	if (message) {
		expect(actual, message).toBe(expectation);
	} else {
		expect(actual).toBe(expectation);
	}
}

export const assertExactOutput = assertOutput;

/**
 * Assert the exact output of a command against an expectation.
 *
 * @param {Rsync|Function} command
 * @param {RegExp|Function} expectation
 * @param {String} message
 */
export function assertOutputPattern(command, expectation, message) {
	command = isFunction(command) ? command() : command;
	expectation = isFunction(expectation) ? expectation() : expectation;
	const actual = command.command();

	if (message) {
		expect(actual, message).toMatch(expectation);
	} else {
		expect(actual).toMatch(expectation);
	}
}

function isFunction(input) {
	return typeof input === "function";
}
