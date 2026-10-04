import type { ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultHotkeys } from "../../../shared/hotkeys/defaultHotkeys";
import { loadConfig } from "../../../shared/loadConfig";
import { makeAssistConfig } from "../../../test/mothers/makeAssistConfig";
import type * as loadConfigMockModule from "../../../test/mocks/loadConfigMock";

const mockLoadConfig = vi.mocked(loadConfig);
const mockRespondJson = vi.fn();

vi.mock("../../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

import { hotkeyBindings } from "./hotkeyBindings";

function run(): unknown {
	hotkeyBindings({} as never, {} as ServerResponse);
	return mockRespondJson.mock.lastCall?.[2];
}

describe("hotkeyBindings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("serves the defaults when nothing is overridden", () => {
		mockLoadConfig.mockReturnValue(makeAssistConfig());
		expect(run()).toEqual(defaultHotkeys);
	});

	it("replaces every default chord of an overridden action", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({
				sessions: { hotkeys: { newSession: "Ctrl+Alt+K", navTab: "Ctrl" } },
			}),
		);
		expect(run()).toEqual({
			...defaultHotkeys,
			newSession: ["Ctrl+Alt+K"],
			navTab: ["Ctrl"],
		});
	});
});
