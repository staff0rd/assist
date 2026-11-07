import { beforeEach, describe, expect, it, vi } from "vitest";
import { isHarnessAvailable } from "../../shared/harnesses";
import { loadConfig } from "../../shared/loadConfig";
import { resolveSynthesisHarness } from "./resolveSynthesisHarness";

vi.mock("../../shared/loadConfig", () => ({ loadConfig: vi.fn() }));
vi.mock("../../shared/harnesses", () => ({ isHarnessAvailable: vi.fn() }));

function configure(synthesisHarness?: "claude" | "codex"): void {
	vi.mocked(loadConfig).mockReturnValue({
		review: synthesisHarness ? { synthesisHarness } : undefined,
	} as ReturnType<typeof loadConfig>);
}

describe("resolveSynthesisHarness", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("defaults to claude without probing PATH", () => {
		configure();
		expect(resolveSynthesisHarness()).toBe("claude");
		expect(isHarnessAvailable).not.toHaveBeenCalled();
	});

	it("uses codex when configured and on PATH", () => {
		configure("codex");
		vi.mocked(isHarnessAvailable).mockReturnValue(true);
		expect(resolveSynthesisHarness()).toBe("codex");
	});

	it("falls back to claude when codex is configured but missing", () => {
		configure("codex");
		vi.mocked(isHarnessAvailable).mockReturnValue(false);
		expect(resolveSynthesisHarness()).toBe("claude");
	});
});
