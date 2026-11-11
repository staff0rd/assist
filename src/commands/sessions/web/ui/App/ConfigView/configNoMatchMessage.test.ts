import { describe, expect, it } from "vitest";
import { configNoMatchMessage } from "./configNoMatchMessage";

describe("configNoMatchMessage", () => {
	it("names only the search term when no scopes are selected", () => {
		expect(configNoMatchMessage(" foo ", new Set())).toBe(
			"No keys or descriptions match “foo”.",
		);
	});

	it("names only the scopes when the search is empty", () => {
		expect(configNoMatchMessage("", new Set(["repo", "project"]))).toBe(
			"No keys come from repo (git), repo (db).",
		);
	});

	it("names both the search term and scopes in source order", () => {
		expect(configNoMatchMessage("foo", new Set(["default", "user"]))).toBe(
			"No keys or descriptions match “foo” in user (db), default.",
		);
	});
});
