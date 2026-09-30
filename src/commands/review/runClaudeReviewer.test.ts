import { afterEach, describe, expect, it, vi } from "vitest";
import type { SpinnerHandle } from "./MultiSpinner";
import { runClaudeReviewer } from "./runClaudeReviewer";
import { runStreamingChild } from "./runStreamingChild";

vi.mock("./runStreamingChild", () => ({ runStreamingChild: vi.fn() }));

const runStreamingChildMock = vi.mocked(runStreamingChild);

const TOOL_USE_LINE = JSON.stringify({
	type: "assistant",
	message: {
		content: [{ type: "tool_use", name: "Read", input: { file_path: "a.ts" } }],
	},
});

function stubChild(): void {
	runStreamingChildMock.mockImplementation(async (spec) => {
		spec.onLine(TOOL_USE_LINE);
		return { exitCode: 0, stderr: "", stdout: "", elapsedMs: 1 };
	});
}

function makeSpinner(): SpinnerHandle {
	return { text: "", succeed: vi.fn(), fail: vi.fn() };
}

function run(spinner?: SpinnerHandle) {
	return runClaudeReviewer({
		name: "claude",
		reviewDir: "/review",
		stdin: "prompt",
		outputPath: "/review/claude.md",
		...(spinner ? { spinner } : {}),
	});
}

describe("runClaudeReviewer", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("leaves the spinner tool-use line bare", async () => {
		stubChild();
		const spinner = makeSpinner();

		await run(spinner);

		expect(spinner.text).toBe("claude — Read: a.ts");
	});

	it("leaves the console tool-use line bare", async () => {
		stubChild();
		const log = vi.spyOn(console, "log").mockImplementation(() => {});

		await run();

		expect(log).toHaveBeenCalledWith("[claude] Read: a.ts");
	});

	it("spawns without a model", async () => {
		stubChild();

		await run();

		const spec = runStreamingChildMock.mock.lastCall?.[0];
		expect(spec?.model).toBeUndefined();
		expect(spec?.env).toBeUndefined();
	});

	it("appends the override's args and env and names its model", async () => {
		stubChild();

		await runClaudeReviewer({
			name: "claude",
			reviewDir: "/review",
			stdin: "prompt",
			outputPath: "/review/claude.md",
			override: {
				args: ["--model", "claude-x"],
				env: { ANTHROPIC_BASE_URL: "https://proxy" },
				model: "claude-x",
			},
		});

		const spec = runStreamingChildMock.mock.lastCall?.[0];
		expect(spec?.args.slice(-2)).toEqual(["--model", "claude-x"]);
		expect(spec?.env).toEqual({ ANTHROPIC_BASE_URL: "https://proxy" });
		expect(spec?.model).toBe("claude-x");
	});
});
