import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../../../test/mothers/makeSessionInfo";
import { sdkComposerState } from "./sdkComposerState";

describe("sdkComposerState", () => {
	it("names the session's agent in the placeholder", () => {
		const state = sdkComposerState(
			makeSessionInfo({ status: "waiting", harness: "codex-sdk" }),
		);

		expect(state.placeholder).toBe("Message Codex…");
	});

	it("keeps Claude as the agent for a claude-sdk session", () => {
		const state = sdkComposerState(
			makeSessionInfo({ status: "running", harness: "claude-sdk" }),
		);

		expect(state.placeholder).toBe(
			"Message Claude… (queues until this turn ends)",
		);
	});
});
