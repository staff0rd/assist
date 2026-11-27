import { describe, expect, it } from "vitest";
import { parseSessionMessage, sessionMessageBody } from "./parseSessionMessage";
import { wrapSessionMessage } from "./wrapSessionMessage";

describe("parseSessionMessage", () => {
	it("reads the sender, agent and body of a tagged message", () => {
		expect(
			parseSessionMessage(
				'<session-message from="2" agent="yoke-2-e6">run hash -r</session-message>',
			),
		).toEqual({ from: "2", agent: "yoke-2-e6", body: "run hash -r" });
	});

	it("reads a sender with no agent", () => {
		expect(
			parseSessionMessage('<session-message from="5">hi</session-message>'),
		).toEqual({ from: "5", body: "hi" });
	});

	it("reads a node-qualified sender", () => {
		expect(
			parseSessionMessage(
				'<session-message from="mac:85" agent="assist-1-7a">hi</session-message>',
			)?.from,
		).toBe("mac:85");
	});

	it("keeps a multi-line body and round-trips escaped attributes", () => {
		const wrapped = wrapSessionMessage('line 1\nline "2"', "2", 'a"b&c');
		expect(parseSessionMessage(wrapped)).toEqual({
			from: "2",
			agent: 'a"b&c',
			body: 'line 1\nline "2"',
		});
	});

	it("returns null for untagged text", () => {
		expect(parseSessionMessage("just a prompt")).toBeNull();
	});

	it("returns null when the tag is only part of the text", () => {
		expect(
			parseSessionMessage(
				'see <session-message from="2">hi</session-message> above',
			),
		).toBeNull();
	});
});

describe("sessionMessageBody", () => {
	it("strips the tag from a tagged message", () => {
		expect(
			sessionMessageBody('<session-message from="2">hi</session-message>'),
		).toBe("hi");
	});

	it("returns untagged text unchanged", () => {
		expect(sessionMessageBody("hi")).toBe("hi");
	});
});
