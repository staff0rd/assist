import { describe, expect, it } from "vitest";
import { parseComposeLogLine } from "./parseComposeLogLine";

const at = Date.parse("2026-11-27T01:02:03.123Z");

describe("parseComposeLogLine", () => {
	it("reads the service, timestamp and message", () => {
		expect(
			parseComposeLogLine(
				"api-1  | 2026-11-27T01:02:03.123456789Z Error: boom | detail",
				"assist-review-app-pr7-abc",
			),
		).toEqual({ service: "api", at, message: "Error: boom | detail" });
	});

	it("strips a project prefix from the container name", () => {
		expect(
			parseComposeLogLine(
				"assist-review-app-pr7-abc-web-api-2 | 2026-11-27T01:02:03.123Z hi",
				"assist-review-app-pr7-abc",
			),
		).toEqual({ service: "web-api", at, message: "hi" });
	});

	it("skips lines without a timestamped prefix", () => {
		expect(parseComposeLogLine("Attaching to api-1", "p")).toBeUndefined();
		expect(parseComposeLogLine("api-1 | not-a-time hi", "p")).toBeUndefined();
	});
});
