import { describe, expect, it } from "vitest";
import { normalizeJiraKey } from "./normalizeJiraKey";

describe("normalizeJiraKey", () => {
	it("passes through a bare key unchanged", () => {
		expect(normalizeJiraKey("PROJ-123")).toBe("PROJ-123");
	});

	it("extracts the key from a browse URL", () => {
		expect(
			normalizeJiraKey("https://centium.atlassian.net/browse/PA-481"),
		).toBe("PA-481");
	});

	it("accepts a trailing slash on the URL", () => {
		expect(
			normalizeJiraKey("https://centium.atlassian.net/browse/PA-481/"),
		).toBe("PA-481");
	});

	it("accepts a query string on the URL", () => {
		expect(
			normalizeJiraKey(
				"https://centium.atlassian.net/browse/PA-481?filter=allissues",
			),
		).toBe("PA-481");
	});

	it("uppercases a key parsed from a URL", () => {
		expect(normalizeJiraKey("https://x.atlassian.net/browse/pa-481")).toBe(
			"PA-481",
		);
	});

	it("trims surrounding whitespace", () => {
		expect(normalizeJiraKey("  PROJ-123  ")).toBe("PROJ-123");
	});

	it("rejects a lowercase bare key", () => {
		expect(normalizeJiraKey("proj-123")).toBeNull();
	});

	it("rejects malformed input", () => {
		expect(normalizeJiraKey("not-a-key")).toBeNull();
		expect(normalizeJiraKey("PROJ")).toBeNull();
		expect(normalizeJiraKey("https://github.com/o/r/issues/5")).toBeNull();
	});
});
