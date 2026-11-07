import { beforeEach, describe, expect, it, vi } from "vitest";
import { runClaudeReviewer } from "./runClaudeReviewer";
import { runCodexReviewer } from "./runCodexReviewer";
import { runSynthesisReviewer } from "./runSynthesisReviewer";

vi.mock("./runClaudeReviewer", () => ({ runClaudeReviewer: vi.fn() }));
vi.mock("./runCodexReviewer", () => ({ runCodexReviewer: vi.fn() }));
vi.mock("./buildCodexModelArgs", () => ({
	buildCodexModelArgs: () => ({ args: [], env: {} }),
}));

const spec = {
	reviewDir: "/review",
	stdin: "prompt",
	outputPath: "/review/synthesis.md",
	multi: undefined,
};

describe("runSynthesisReviewer", () => {
	beforeEach(() => vi.clearAllMocks());

	it("synthesises with claude in the review dir by default", async () => {
		await runSynthesisReviewer({ ...spec, harness: "claude" });
		expect(runClaudeReviewer).toHaveBeenCalledWith({
			name: "synthesis",
			reviewDir: "/review",
			stdin: "prompt",
			outputPath: "/review/synthesis.md",
			spinner: undefined,
		});
		expect(runCodexReviewer).not.toHaveBeenCalled();
	});

	it("synthesises with codex when that harness is selected", async () => {
		await runSynthesisReviewer({ ...spec, harness: "codex" });
		expect(runCodexReviewer).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "synthesis",
				stdin: "prompt",
				outputPath: "/review/synthesis.md",
			}),
		);
		expect(runClaudeReviewer).not.toHaveBeenCalled();
	});
});
