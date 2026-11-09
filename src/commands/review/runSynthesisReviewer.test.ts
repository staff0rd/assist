import { beforeEach, describe, expect, it, vi } from "vitest";
import { runClaudeReviewer } from "./runClaudeReviewer";
import { runCodexReviewer } from "./runCodexReviewer";
import { runSynthesisReviewer } from "./runSynthesisReviewer";

vi.mock("./runClaudeReviewer", () => ({ runClaudeReviewer: vi.fn() }));
vi.mock("./runCodexReviewer", () => ({ runCodexReviewer: vi.fn() }));
vi.mock("../../shared/harnessAdapters/detectHarness", () => ({
	detectHarness: () => ({ supported: true }),
}));
vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => ({ review: {} }),
}));

const spec = {
	reviewDir: "/review",
	stdin: "prompt",
	outputPath: "/review/synthesis.md",
};

describe("runSynthesisReviewer", () => {
	beforeEach(() => vi.clearAllMocks());

	it("synthesises with claude in the review dir by default", async () => {
		await runSynthesisReviewer({
			...spec,
			multi: undefined,
			harness: "claude",
		});
		expect(runClaudeReviewer).toHaveBeenCalledWith({
			name: "synthesis",
			reviewDir: "/review",
			stdin: "prompt",
			outputPath: "/review/synthesis.md",
			model: undefined,
			spinner: undefined,
		});
		expect(runCodexReviewer).not.toHaveBeenCalled();
	});

	it("synthesises with codex when that harness is selected", async () => {
		await runSynthesisReviewer({ ...spec, multi: undefined, harness: "codex" });
		expect(runCodexReviewer).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "synthesis",
				stdin: "prompt",
				outputPath: "/review/synthesis.md",
			}),
		);
		expect(runClaudeReviewer).not.toHaveBeenCalled();
	});

	it.each([
		["claude", "synthesis — starting"],
		["codex", "synthesis (codex) — starting"],
	] as const)("labels the %s synthesis spinner", async (harness, label) => {
		const create = vi.fn();
		await runSynthesisReviewer({
			...spec,
			harness,
			multi: { create } as never,
		});
		expect(create).toHaveBeenCalledWith(label);
	});
});
