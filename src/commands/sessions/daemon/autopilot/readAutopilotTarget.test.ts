import { describe, expect, it, vi } from "vitest";

const config = vi.hoisted(() => ({
	value: {} as Record<string, unknown>,
}));

vi.mock("../../../../shared/loadConfigFrom", () => ({
	loadConfigFrom: () => config.value,
}));

import { readAutopilotTarget } from "./readAutopilotTarget";

const autopilot = { prompt: "/helm", intervalMinutes: 60, node: "mac" };

describe("readAutopilotTarget", () => {
	it("launches with the repo's harness engine", () => {
		config.value = { autopilot, harness: { engine: "claude-sdk" } };
		expect(readAutopilotTarget("/repo", "mac")).toMatchObject({
			harness: "claude-sdk",
			scheduledHere: true,
		});
	});

	it("prefers the repo's prompt-session harness and model", () => {
		config.value = {
			autopilot,
			harness: {
				engine: "claude",
				defaults: { prompt: { harness: "codex", model: "gpt-5" } },
			},
		};
		expect(readAutopilotTarget("/repo", "mac")).toMatchObject({
			harness: "codex",
			model: "gpt-5",
		});
	});
});
