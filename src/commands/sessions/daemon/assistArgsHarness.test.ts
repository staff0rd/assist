import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadMergedRawConfig } from "../../../shared/loadConfigFrom";
import { assistConfigSchema } from "../../../shared/types";
import { assistArgsHarness } from "./assistArgsHarness";

vi.mock("../../../shared/loadConfigFrom", () => ({
	loadMergedRawConfig: vi.fn(),
}));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const mockLoadMergedRawConfig = vi.mocked(loadMergedRawConfig);

describe("assistArgsHarness", () => {
	beforeEach(() => {
		mockLoadMergedRawConfig.mockReturnValue({
			harness: {
				engine: "codex",
				defaults: { run: { harness: "claude-sdk" } },
			},
		});
	});

	it("takes an explicit --harness flag", () => {
		expect(
			assistArgsHarness(["refine", "--harness", "claude-sdk", "a1"], "/r"),
		).toBe("claude-sdk");
		expect(assistArgsHarness(["review", "--harness=pi"], "/r")).toBe("pi");
	});

	it("uses the command type's configured default", () => {
		expect(assistArgsHarness(["backlog", "run", "a1"], "/r")).toBe(
			"claude-sdk",
		);
		expect(assistArgsHarness(["next"], "/r")).toBe("claude-sdk");
		expect(mockLoadMergedRawConfig).toHaveBeenCalledWith("/r");
	});

	it("falls back to the engine, then to claude", () => {
		expect(assistArgsHarness(["fix-conflict"], "/r")).toBe("codex");
		mockLoadMergedRawConfig.mockReturnValue({});
		expect(assistArgsHarness(["draft"], "/r")).toBe("claude");
	});

	it("resolves the harness when the config has keys from a newer version", () => {
		const raw = {
			review: { highLevel: { requireLinkedIssue: true } },
			harness: {
				engine: "codex",
				futureKnob: true,
				defaults: {
					run: { harness: "claude-sdk", futureKnob: 1 },
					futureType: { harness: "pi" },
				},
			},
		};
		expect(assistConfigSchema.safeParse(raw).success).toBe(false);
		mockLoadMergedRawConfig.mockReturnValue(raw);
		expect(assistArgsHarness(["backlog", "run", "a1"], "/r")).toBe(
			"claude-sdk",
		);
		expect(assistArgsHarness(["bug"], "/r")).toBe("codex");
	});

	it("resolves nothing for an unknown --harness flag", () => {
		expect(assistArgsHarness(["draft", "--harness", "nope"], "/r")).toBe(
			undefined,
		);
	});

	it("throws a restart hint when the config can't be read or names an unknown harness", () => {
		mockLoadMergedRawConfig.mockImplementation(() => {
			throw new Error("bad yaml");
		});
		expect(() => assistArgsHarness(["draft"], "/r")).toThrow(
			/bad yaml.*restart the daemon/,
		);
		mockLoadMergedRawConfig.mockReturnValue({
			harness: { defaults: { run: { harness: "future-sdk" } } },
		});
		expect(() => assistArgsHarness(["backlog", "run", "a1"], "/r")).toThrow(
			/unknown harness "future-sdk"/,
		);
	});
});
