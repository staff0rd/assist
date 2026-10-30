import { describe, expect, it } from "vitest";
import type { ConfigWriteScope } from "../../../../../../config/ConfigWriteScope";
import type { ConfigEntry } from "../../../../../../config/readConfigEntries";
import type { ConfigSource } from "../../../../../../config/resolveConfigSources";
import { defaultConfigScope } from "./defaultConfigScope";

const entry = (
	sources: ConfigSource[],
	writableScopes?: ConfigWriteScope[],
): ConfigEntry => ({
	key: "run",
	type: "array",
	value: undefined,
	source: sources[0] ?? "default",
	sources,
	writableScopes,
});

describe("defaultConfigScope", () => {
	it("falls back to project when the key is unset everywhere", () => {
		expect(defaultConfigScope(entry([]))).toBe("project");
	});

	it("uses the only scope holding a value", () => {
		expect(defaultConfigScope(entry(["project"]))).toBe("project");
		expect(defaultConfigScope(entry(["repo"]))).toBe("repo");
		expect(defaultConfigScope(entry(["global"]))).toBe("global");
	});

	it("uses the highest-precedence scope when several hold a value", () => {
		expect(defaultConfigScope(entry(["repo", "global"]))).toBe("repo");
		expect(defaultConfigScope(entry(["project", "repo", "global"]))).toBe(
			"project",
		);
	});

	it("ignores source order and follows scope precedence", () => {
		expect(defaultConfigScope(entry(["global", "repo"]))).toBe("repo");
	});

	it("stays at global for a global-only key", () => {
		expect(defaultConfigScope(entry([], ["global"]))).toBe("global");
		expect(defaultConfigScope(entry(["global"], ["global"]))).toBe("global");
	});

	it("skips a value held in a scope the key can't be written to", () => {
		expect(
			defaultConfigScope(entry(["user"], ["project", "repo", "global"])),
		).toBe("project");
		expect(defaultConfigScope(entry([], ["user"]))).toBe("user");
	});
});
