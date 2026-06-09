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

	it("resumes by sessionId instead of re-injecting the prompt", () => {
		spawnClaude("do the thing", { resumeSessionId: "abc-123" });

		expect(spawnedArgs()).toEqual(["--resume", "abc-123"]);
	});

	it("keeps the permission mode flag when resuming", () => {
		spawnClaude("do the thing", {
			resumeSessionId: "abc-123",
			allowEdits: true,
		});

		expect(spawnedArgs()).toEqual([
			"--resume",
			"abc-123",
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
