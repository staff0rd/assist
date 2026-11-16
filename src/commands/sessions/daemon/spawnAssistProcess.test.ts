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

	it.each(["claude-sdk", "codex-sdk"] as const)(
		"runs a %s workflow without a terminal",
		(harness) => {
			vi.mocked(assistArgsHarness).mockReturnValue(harness);
			spawnAssistProcess(["assist", "backlog", "run"], "/r", "1");
			expect(spawnSdkWorkflow).toHaveBeenCalledWith(
				harness,
				["assist", "backlog", "run"],
				"/r",
				"1",
				undefined,
			);
			expect(spawnPty).not.toHaveBeenCalled();
		},
	);

	it.each(["claude", "codex", "pi", undefined] as const)(
		"runs a %s workflow in a terminal",
		(harness) => {
			vi.mocked(assistArgsHarness).mockReturnValue(harness);
			spawnAssistProcess(["assist", "backlog", "run"], "/r", "1");
			expect(spawnPty).toHaveBeenCalled();
			expect(spawnSdkWorkflow).not.toHaveBeenCalled();
		},
	);
});
