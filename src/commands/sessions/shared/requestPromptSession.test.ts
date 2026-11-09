import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../../shared/loadConfig";
import type * as loadConfigMockModule from "../../../test/mocks/loadConfigMock";
import { makeAssistConfig } from "../../../test/mothers/makeAssistConfig";
import { requestPromptSession } from "./requestPromptSession";
import { requestSession } from "./requestSession";

vi.mock("../../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);
vi.mock("./requestSession", () => ({
	requestSession: vi.fn(async () => "9"),
}));

describe("requestPromptSession", () => {
	beforeEach(() => vi.clearAllMocks());

	it("launches the prompt on the configured harness.engine", async () => {
		vi.mocked(loadConfig).mockReturnValue(
			makeAssistConfig({ harness: { engine: "codex" } }),
		);

		await requestPromptSession("fix it", "/repo", { launchedFrom: "3" });

		expect(requestSession).toHaveBeenCalledWith({
			type: "create",
			prompt: "fix it",
			cwd: "/repo",
			harness: "codex",
			inPlace: false,
			launchedFrom: "3",
		});
	});
});
