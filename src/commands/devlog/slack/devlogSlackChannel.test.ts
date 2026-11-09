import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../../shared/loadConfig";
import type * as loadConfigMockModule from "../../../test/mocks/loadConfigMock";
import { makeAssistConfig } from "../../../test/mothers/makeAssistConfig";
import { devlogSlackChannel } from "./devlogSlackChannel";

vi.mock("../../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

const mockLoadConfig = vi.mocked(loadConfig);
const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});
const mockError = vi.spyOn(console, "error").mockImplementation(() => {});

beforeEach(() => {
	vi.clearAllMocks();
});

describe("devlogSlackChannel", () => {
	it("prefers devlog.slack over slack.channel", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({
				devlog: { slack: "#devlog" },
				slack: { channel: "#general" },
			}),
		);
		expect(devlogSlackChannel()).toBe("#devlog");
	});

	it("falls back to slack.channel", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ slack: { channel: "#general" } }),
		);
		expect(devlogSlackChannel()).toBe("#general");
	});

	it("exits non-zero naming both keys when neither is set", () => {
		mockLoadConfig.mockReturnValue(makeAssistConfig());
		expect(() => devlogSlackChannel()).toThrow("process.exit");
		expect(mockExit).toHaveBeenCalledWith(1);
		const message = mockError.mock.calls[0][0] as string;
		expect(message).toContain("devlog.slack");
		expect(message).toContain("slack.channel");
	});
});
