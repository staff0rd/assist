import { beforeEach, describe, expect, it, vi } from "vitest";
import { assistArgsHarness } from "./assistArgsHarness";
import { spawnSdkWorkflow } from "./sdk/spawnSdkWorkflow";
import { spawnAssistProcess } from "./spawnAssistProcess";
import { spawnPty } from "./spawnPty";

vi.mock("./assistArgsHarness", () => ({ assistArgsHarness: vi.fn() }));
vi.mock("./sdk/spawnSdkWorkflow", () => ({ spawnSdkWorkflow: vi.fn() }));
vi.mock("./spawnPty", () => ({ spawnPty: vi.fn() }));

describe("spawnAssistProcess", () => {
	beforeEach(() => vi.clearAllMocks());

	it("runs a workflow on a daemon-driven harness without a terminal", () => {
		vi.mocked(assistArgsHarness).mockReturnValue("claude-sdk");
		spawnAssistProcess(["assist", "backlog", "run"], "/r", "1");
		expect(spawnSdkWorkflow).toHaveBeenCalled();
		expect(spawnPty).not.toHaveBeenCalled();
	});

	it.each(["codex", undefined] as const)(
		"runs a %s workflow in a terminal",
		(harness) => {
			vi.mocked(assistArgsHarness).mockReturnValue(harness);
			spawnAssistProcess(["assist", "backlog", "run"], "/r", "1");
			expect(spawnPty).toHaveBeenCalled();
			expect(spawnSdkWorkflow).not.toHaveBeenCalled();
		},
	);
});
