import { describe, expect, it } from "vitest";
import { parseBrowserRequest } from "./parseBrowserRequest";

describe("parseBrowserRequest console", () => {
	it("passes every filter through", () => {
		const request = {
			op: "console",
			url: "github.com",
			all: false,
			sinceMs: 60_000,
			grep: "boom",
			limit: 5,
		};
		expect(parseBrowserRequest(request)).toEqual(request);
	});

	it("accepts a request with no filters", () => {
		expect(parseBrowserRequest({ op: "console" })).toMatchObject({
			op: "console",
		});
	});

	it.each([
		{ all: "yes" },
		{ sinceMs: 0 },
		{ sinceMs: "1h" },
		{ grep: 3 },
		{ limit: 0 },
		{ limit: 1.5 },
		{ url: 7 },
	])("rejects %o", (fields) => {
		expect(parseBrowserRequest({ op: "console", ...fields })).toBeUndefined();
	});
});
