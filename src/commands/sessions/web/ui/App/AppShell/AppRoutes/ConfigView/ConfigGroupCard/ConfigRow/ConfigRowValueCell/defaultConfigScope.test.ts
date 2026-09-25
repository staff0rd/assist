import { describe, expect, it } from "vitest";
import type { ConfigEntry } from "../../../../../../../../../../config/readConfigEntries";
import type { ConfigSource } from "../../../../../../../../../../config/resolveConfigSources";
import { defaultConfigScope } from "./defaultConfigScope";

const entry = (sources: ConfigSource[], globalOnly = false): ConfigEntry => ({
	key: "run",
	type: "array",
	value: undefined,
	source: sources[0] ?? "default",
	sources,
	globalOnly,
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
		expect(defaultConfigScope(entry([], true))).toBe("global");
		expect(defaultConfigScope(entry(["global"], true))).toBe("global");
	});
});
