import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../shared/loadConfig";
import { makeAssistConfig } from "../../test/mothers/makeAssistConfig";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

import { resolveHarness } from "./resolveHarness";

const mockLoadConfig = vi.mocked(loadConfig);

describe("resolveHarness", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ harness: { engine: "claude" } }),
		);
	});

	it("returns an explicit valid harness value", () => {
		expect(resolveHarness("codex")).toBe("codex");
		expect(resolveHarness("claude")).toBe("claude");
		expect(resolveHarness("pi")).toBe("pi");
		expect(mockLoadConfig).not.toHaveBeenCalled();
	});

	it("falls back to the configured engine when pi is the default", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ harness: { engine: "pi" } }),
		);
		expect(resolveHarness(undefined)).toBe("pi");
	});

	it("falls back to the configured engine when no value is given", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ harness: { engine: "codex" } }),
		);
		expect(resolveHarness(undefined)).toBe("codex");
	});

	it("falls back to the configured engine for an unrecognised value", () => {
		expect(resolveHarness("gpt")).toBe("claude");
	});
});
