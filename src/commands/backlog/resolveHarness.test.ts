import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as harnessesModule from "../../shared/harnesses";
import { isHarnessAvailable } from "../../shared/harnesses";
import { loadMergedRawConfig } from "../../shared/loadConfigFrom";
import { loadConfig } from "../../shared/loadConfig";
import { makeAssistConfig } from "../../test/mothers/makeAssistConfig";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";

vi.mock("../../shared/loadConfigFrom", () => ({
	loadMergedRawConfig: vi.fn(),
}));
vi.mock("../../shared/harnesses", async (importOriginal) => ({
	...(await importOriginal<typeof harnessesModule>()),
	isHarnessAvailable: vi.fn(),
}));

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
		vi.mocked(loadMergedRawConfig).mockReturnValue({
			harness: { engine: "claude" },
		});
		vi.mocked(isHarnessAvailable).mockReturnValue(false);
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ harness: { engine: "claude" } }),
		);
	});

	it.each(["codex", "pi"] as const)(
		"uses installed %s for an unconfigured run without Claude",
		(installed) => {
			vi.mocked(loadMergedRawConfig).mockReturnValue({});
			vi.mocked(isHarnessAvailable).mockImplementation(
				(kind) => kind === installed,
			);
			expect(resolveHarness(undefined, "run")).toBe(installed);
		},
	);

	it("prefers Claude when installed and no run harness is configured", () => {
		vi.mocked(loadMergedRawConfig).mockReturnValue({});
		vi.mocked(isHarnessAvailable).mockReturnValue(true);
		expect(resolveHarness(undefined, "run")).toBe("claude");
	});

	it("preserves an explicitly configured unavailable Claude engine", () => {
		expect(resolveHarness(undefined, "run")).toBe("claude");
		expect(isHarnessAvailable).not.toHaveBeenCalled();
	});

	it("preserves an unavailable run default over an installed harness", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({
				harness: { defaults: { run: { harness: "claude" } } },
			}),
		);
		vi.mocked(isHarnessAvailable).mockImplementation(
			(kind) => kind === "codex",
		);
		expect(resolveHarness(undefined, "run")).toBe("claude");
		expect(isHarnessAvailable).not.toHaveBeenCalled();
	});

	it("retains the default error path when no harness is installed", () => {
		vi.mocked(loadMergedRawConfig).mockReturnValue({});
		expect(resolveHarness(undefined, "run")).toBe("claude");
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

	it("uses the type's configured default harness over the engine", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({
				harness: { engine: "claude", defaults: { run: { harness: "codex" } } },
			}),
		);
		expect(resolveHarness(undefined, "run")).toBe("codex");
		expect(resolveHarness(undefined, "draft")).toBe("claude");
		expect(resolveHarness(undefined)).toBe("claude");
	});

	it("lets an explicit harness override the type's default", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({
				harness: { engine: "claude", defaults: { bug: { harness: "codex" } } },
			}),
		);
		expect(resolveHarness("pi", "bug")).toBe("pi");
	});
});
