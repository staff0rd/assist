import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLoadConfig = vi.fn();

vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

import { resolveHarness } from "./resolveHarness";

describe("resolveHarness", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadConfig.mockReturnValue({ harness: { engine: "claude" } });
	});

	it("returns an explicit valid harness value", () => {
		expect(resolveHarness("codex")).toBe("codex");
		expect(resolveHarness("claude")).toBe("claude");
		expect(resolveHarness("pi")).toBe("pi");
		expect(mockLoadConfig).not.toHaveBeenCalled();
	});

	it("falls back to the configured engine when pi is the default", () => {
		mockLoadConfig.mockReturnValue({ harness: { engine: "pi" } });
		expect(resolveHarness(undefined)).toBe("pi");
	});

	it("falls back to the configured engine when no value is given", () => {
		mockLoadConfig.mockReturnValue({ harness: { engine: "codex" } });
		expect(resolveHarness(undefined)).toBe("codex");
	});

	it("falls back to the configured engine for an unrecognised value", () => {
		expect(resolveHarness("gpt")).toBe("claude");
	});
});
