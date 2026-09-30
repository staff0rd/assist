import { beforeEach, describe, expect, it, vi } from "vitest";
import { runAndSynthesise } from "./runAndSynthesise";
import { runReviewers } from "./runReviewers";
import type { ReviewerResult } from "./runStreamingChild";
import { synthesise } from "./synthesise";

vi.mock("./buildReviewerStdin", () => ({ buildReviewerStdin: () => "stdin" }));
vi.mock("./runReviewers", () => ({ runReviewers: vi.fn() }));
vi.mock("./synthesise", () => ({ synthesise: vi.fn() }));

const paths = {
	reviewDir: "/r",
	requestPath: "/r/request.md",
	claudePath: "/r/claude.md",
	codexPath: "/r/codex.md",
	synthesisPath: "/r/does-not-exist/synthesis.md",
};

function result(name: string, exitCode: number): ReviewerResult {
	return { name, outputPath: `/r/${name}.md`, exitCode, stderr: "" };
}

function run(strict: boolean) {
	return runAndSynthesise({
		paths,
		cachedClaude: null,
		codexPlan: { kind: "run" },
		multi: undefined,
		models: {},
		strict,
	});
}

describe("runAndSynthesise", () => {
	beforeEach(() => {
		vi.mocked(runReviewers).mockResolvedValue({
			results: [result("claude", 0), result("codex", 1)],
			anyFresh: true,
		});
		vi.mocked(synthesise).mockResolvedValue(result("synthesis", 0));
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("synthesises from the surviving reviewer when not strict", async () => {
		const outcome = await run(false);

		expect(outcome.ok).toBe(true);
		expect(synthesise).toHaveBeenCalled();
	});

	it("skips synthesis when any reviewer failed in strict mode", async () => {
		vi.mocked(synthesise).mockClear();

		const outcome = await run(true);

		expect(outcome.ok).toBe(false);
		expect(outcome.failures.map((f) => f.name)).toEqual(["codex"]);
		expect(synthesise).not.toHaveBeenCalled();
	});
});
