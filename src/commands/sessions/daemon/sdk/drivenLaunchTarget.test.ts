import { describe, expect, it } from "vitest";
import { claudeSdkAdapter } from "../../../../shared/harnessAdapters/claudeSdkAdapter";
import { codexSdkAdapter } from "../../../../shared/harnessAdapters/codexSdkAdapter";
import { drivenLaunchTarget } from "./drivenLaunchTarget";

describe("drivenLaunchTarget", () => {
	it.each([
		["claude-sdk", claudeSdkAdapter],
		["codex-sdk", codexSdkAdapter],
	] as const)("starts a %s query through its adapter", (harness, adapter) => {
		const target = drivenLaunchTarget(harness);
		expect(target.harness).toBe(harness);
		expect(target.drivenSession).toBeDefined();
		expect(target.drivenSession).toBe(adapter.drivenSession);
	});

	it.each(["claude", "codex", "pi", "bogus", undefined])(
		"refuses %s, which does not run daemon-driven sessions",
		(harness) => {
			expect(drivenLaunchTarget(harness).drivenSession).toBeUndefined();
		},
	);
});
