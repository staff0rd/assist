import { describe, expect, it } from "vitest";
import { formatFailureBugPrompt } from "./formatFailureBugPrompt";

describe("formatFailureBugPrompt", () => {
	it("includes every failure field, the page URL and the version", () => {
		const prompt = formatFailureBugPrompt(
			{
				at: "2026-10-31T01:02:03.000Z",
				method: "GET",
				path: "/api/new-session-defaults?node=mac",
				base: "https://home.ts.net:3100",
				node: "mac",
				status: 504,
				error: "Gateway Timeout",
				durationMs: 20012,
			},
			"https://home.ts.net:3100/sessions",
			"0.1077.2",
		);
		for (const part of [
			"Time: 2026-10-31T01:02:03.000Z",
			"Kind: request",
			"Method: GET",
			"Path: /api/new-session-defaults?node=mac",
			"Base: https://home.ts.net:3100",
			"Node: mac",
			"Status: 504",
			"Error: Gateway Timeout",
			"Duration: 20012ms",
			"Page URL: https://home.ts.net:3100/sessions",
			"Assist version: 0.1077.2",
		])
			expect(prompt).toContain(part);
	});

	it("marks missing optional fields", () => {
		const prompt = formatFailureBugPrompt(
			{
				at: "2026-10-31T01:02:03.000Z",
				kind: "error",
				method: "",
				path: "",
				base: "http://localhost:3100",
				durationMs: 0,
			},
			"http://localhost:3100/",
			"",
		);
		expect(prompt).toContain("Kind: error");
		expect(prompt).toContain("Node: (local)");
		expect(prompt).toContain("Status: (none)");
		expect(prompt).toContain("Error: (none)");
		expect(prompt).toContain("Assist version: (unknown)");
	});
});
