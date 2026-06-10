import { spawn } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	type SpawnClaudeOptions,
	spawnClaude,
	withoutResumeSession,
} from "./spawnClaude";

vi.mock("node:child_process", () => ({
	spawn: vi.fn(() => ({ on: vi.fn() })),
}));

const spawnMock = spawn as unknown as ReturnType<typeof vi.fn>;

function spawnedArgs(): string[] {
	return spawnMock.mock.lastCall?.[1] as string[];
}

describe("spawnClaude", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("passes the prompt as the first argument for a fresh session", () => {
		spawnClaude("do the thing");

		expect(spawnedArgs()).toEqual(["do the thing"]);
	});

	it("assigns a specific session id to a fresh session", () => {
		spawnClaude("do the thing", { sessionId: "new-1" });

		expect(spawnedArgs()).toEqual(["--session-id", "new-1", "do the thing"]);
	});

	it("resumes by sessionId and passes the prompt as a continuation nudge", () => {
		spawnClaude("continue where you left off", { resumeSessionId: "abc-123" });

		expect(spawnedArgs()).toEqual([
			"--resume",
			"abc-123",
			"continue where you left off",
		]);
	});

	it("prefers resuming over assigning a fresh session id", () => {
		spawnClaude("continue", { sessionId: "new-1", resumeSessionId: "abc-123" });

		expect(spawnedArgs()).toEqual(["--resume", "abc-123", "continue"]);
	});

	it("keeps the permission mode flag when resuming", () => {
		spawnClaude("continue", {
			resumeSessionId: "abc-123",
			allowEdits: true,
		});

		expect(spawnedArgs()).toEqual([
			"--resume",
			"abc-123",
			"continue",
			"--permission-mode",
			"auto",
		]);
	});
});

describe("withoutResumeSession", () => {
	it("drops resumeSessionId while preserving other options", () => {
		const options: SpawnClaudeOptions = {
			allowEdits: true,
			resumeSessionId: "abc-123",
		};

		expect(withoutResumeSession(options)).toEqual({ allowEdits: true });
	});

	it("returns the options unchanged when there is nothing to strip", () => {
		expect(withoutResumeSession(undefined)).toBeUndefined();
		expect(withoutResumeSession({ allowEdits: true })).toEqual({
			allowEdits: true,
		});
	});
});
