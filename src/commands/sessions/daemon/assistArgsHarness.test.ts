import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfigFrom } from "../../../shared/loadConfigFrom";
import { makeAssistConfig } from "../../../test/mothers/makeAssistConfig";
import { assistArgsHarness } from "./assistArgsHarness";

vi.mock("../../../shared/loadConfigFrom", () => ({ loadConfigFrom: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const mockLoadConfigFrom = vi.mocked(loadConfigFrom);

describe("assistArgsHarness", () => {
	beforeEach(() => {
		mockLoadConfigFrom.mockReturnValue(
			makeAssistConfig({
				harness: {
					engine: "codex",
					defaults: { run: { harness: "claude-sdk" } },
				},
			}),
		);
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
		expect(mockLoadConfigFrom).toHaveBeenCalledWith("/r");
	});

	it("falls back to the engine", () => {
		expect(assistArgsHarness(["fix-conflict"], "/r")).toBe("codex");
	});

	it("resolves nothing for an unknown harness or unreadable config", () => {
		expect(assistArgsHarness(["draft", "--harness", "nope"], "/r")).toBe(
			undefined,
		);
		mockLoadConfigFrom.mockImplementation(() => {
			throw new Error("bad yaml");
		});
		expect(assistArgsHarness(["draft"], "/r")).toBe(undefined);
	});
});
