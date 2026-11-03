import { describe, expect, it } from "vitest";
import { formatConfigPath } from "./formatConfigPath";
import { parseConfigPath } from "./parseConfigPath";

describe("parseConfigPath", () => {
	it("parses keys, array items, indexes and record entries", () => {
		expect(parseConfigPath("sql.connections[].password")).toEqual([
			{ kind: "key", name: "sql" },
			{ kind: "key", name: "connections" },
			{ kind: "item" },
			{ kind: "key", name: "password" },
		]);
		expect(parseConfigPath("run[0].env.*")).toEqual([
			{ kind: "key", name: "run" },
			{ kind: "index", index: 0 },
			{ kind: "key", name: "env" },
			{ kind: "entry" },
		]);
	});

	it("round-trips through formatConfigPath", () => {
		for (const text of [
			"",
			"harness.engine",
			"deny[].pattern",
			"run[2].params[].required",
			"cliReadVerbs.*",
			"extension.redirects.*[0]",
		]) {
			expect(formatConfigPath(parseConfigPath(text) ?? [])).toBe(text);
		}
	});

	it("rejects malformed paths", () => {
		for (const text of ["a..b", ".a", "a.", "a[", "a[x]", "a.[0]"]) {
			expect(parseConfigPath(text)).toBeUndefined();
		}
	});
});
