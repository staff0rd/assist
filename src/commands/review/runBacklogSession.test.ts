import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSpawnClaude = vi.fn((..._args: unknown[]) => ({
	done: Promise.resolve(0),
}));

vi.mock("../../shared/spawnClaude", () => ({
	spawnClaude: (...args: unknown[]) => mockSpawnClaude(...args),
}));

import { buildBacklogPrompt, runBacklogSession } from "./runBacklogSession";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("buildBacklogPrompt", () => {
	it("should invoke /bug with the synthesis path", () => {
		const prompt = buildBacklogPrompt("/repo/review/synthesis.md");

		expect(prompt).toMatch(/^\/bug /);
		expect(prompt).toContain("/repo/review/synthesis.md");
	});

	it("should instruct one item with every finding as a phase", () => {
		const prompt = buildBacklogPrompt("/repo/review/synthesis.md");

		expect(prompt).toContain("ONE bug backlog item");
		expect(prompt).toContain("EVERY finding");
		expect(prompt).toContain("already-raised");
	});

	it("should instruct leaving the synthesis file untouched", () => {
		const prompt = buildBacklogPrompt("/repo/review/synthesis.md");

		expect(prompt).toContain(
			"Do not edit /repo/review/synthesis.md — leave it untouched.",
		);
	});
});

describe("runBacklogSession", () => {
	it("should spawn Claude with edits allowed", async () => {
		await runBacklogSession("/repo/review/synthesis.md");

		expect(mockSpawnClaude).toHaveBeenCalledWith(
			buildBacklogPrompt("/repo/review/synthesis.md"),
			{ allowEdits: true },
		);
	});
});
