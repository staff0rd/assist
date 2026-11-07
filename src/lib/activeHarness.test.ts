import { afterEach, describe, expect, it, vi } from "vitest";
import { activeHarness, markActiveHarness } from "./activeHarness";

function stubAgentEnv(env: Record<string, string | undefined>): void {
	for (const key of ["CLAUDECODE", "CODEX_TOOL_CALL_ID", "CODEX_THREAD_ID"])
		vi.stubEnv(key, env[key]);
}

afterEach(() => {
	markActiveHarness(undefined);
	vi.unstubAllEnvs();
});

describe("activeHarness", () => {
	it("is undefined outside an agent", () => {
		stubAgentEnv({});
		expect(activeHarness()).toBeUndefined();
	});

	it("detects Claude Code from CLAUDECODE", () => {
		stubAgentEnv({ CLAUDECODE: "1" });
		expect(activeHarness()).toBe("claude");
	});

	it("detects Codex from its thread id", () => {
		stubAgentEnv({ CODEX_THREAD_ID: "t1" });
		expect(activeHarness()).toBe("codex");
	});

	it("prefers a harness declared by a hook entry point", () => {
		stubAgentEnv({ CLAUDECODE: "1" });
		markActiveHarness("codex");
		expect(activeHarness()).toBe("codex");
	});
});
