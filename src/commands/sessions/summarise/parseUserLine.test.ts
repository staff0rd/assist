import { describe, expect, it } from "vitest";
import { parseUserLine } from "./parseUserLine";

function userLine(text: string, extra: Record<string, unknown> = {}): string {
	return JSON.stringify({
		type: "user",
		message: { role: "user", content: text },
		...extra,
	});
}

describe("parseUserLine", () => {
	it("returns undefined for non-JSON lines", () => {
		expect(parseUserLine("not json")).toBeUndefined();
	});

	it("returns undefined for entries that are not type:user", () => {
		expect(
			parseUserLine(
				JSON.stringify({
					type: "assistant",
					message: { role: "assistant", content: "hi" },
				}),
			),
		).toBeUndefined();
	});

	it("returns text for string content", () => {
		const got = parseUserLine(userLine("hello"));
		expect(got).toEqual({ text: "hello" });
	});

	it("captures entrypoint metadata when present", () => {
		const got = parseUserLine(userLine("hi", { entrypoint: "cli" }));
		expect(got).toEqual({ text: "hi", entrypoint: "cli" });
	});

	it("captures sdk-cli entrypoint", () => {
		const got = parseUserLine(userLine("hi", { entrypoint: "sdk-cli" }));
		expect(got?.entrypoint).toBe("sdk-cli");
	});

	it("joins text blocks from array content", () => {
		const line = JSON.stringify({
			type: "user",
			message: {
				role: "user",
				content: [
					{ type: "text", text: "one" },
					{ type: "text", text: "two" },
				],
			},
		});
		expect(parseUserLine(line)?.text).toBe("one\ntwo");
	});

	it("skips entries whose content is only tool_result blocks", () => {
		const line = JSON.stringify({
			type: "user",
			message: {
				role: "user",
				content: [
					{ type: "tool_result", tool_use_id: "abc", content: "result" },
				],
			},
		});
		expect(parseUserLine(line)).toBeUndefined();
	});

	it("returns undefined for empty string content", () => {
		expect(parseUserLine(userLine(""))).toBeUndefined();
	});
});
