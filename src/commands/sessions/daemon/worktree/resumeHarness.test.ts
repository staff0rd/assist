import { describe, expect, it, vi } from "vitest";
import type { HarnessKind } from "../../../../shared/harnesses";
import { loadConfigFrom } from "../../../../shared/loadConfigFrom";
import { resumeHarness } from "./resumeHarness";

vi.mock("../../../../shared/loadConfigFrom", () => ({
	loadConfigFrom: vi.fn(),
}));

function engine(kind: HarnessKind) {
	vi.mocked(loadConfigFrom).mockReturnValue({
		harness: { engine: kind },
	} as ReturnType<typeof loadConfigFrom>);
}

describe("resumeHarness", () => {
	it("resumes a Claude conversation with the configured SDK engine", () => {
		engine("claude-sdk");
		expect(resumeHarness("claude", "/git/repo")).toBe("claude-sdk");
		expect(resumeHarness(undefined, "/git/repo")).toBe("claude-sdk");
		expect(loadConfigFrom).toHaveBeenCalledWith("/git/repo");
	});

	it("resumes a Claude conversation in the terminal when that is the engine", () => {
		engine("claude");
		expect(resumeHarness("claude-sdk", "/git/repo")).toBe("claude");
	});

	it("keeps the conversation's harness when the engine is not Claude", () => {
		engine("codex");
		expect(resumeHarness("claude", "/git/repo")).toBe("claude");
	});

	it("keeps a non-Claude conversation's harness", () => {
		engine("claude-sdk");
		expect(resumeHarness("codex", "/git/repo")).toBe("codex");
	});
});
