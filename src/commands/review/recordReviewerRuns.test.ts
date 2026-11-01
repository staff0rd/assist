import { describe, expect, it, vi } from "vitest";
import type { BacklogDatabase } from "../../shared/db/Db";
import { recordJobRun } from "../../shared/db/recordJobRun";
import { recordReviewerRuns } from "./recordReviewerRuns";

vi.mock("../../shared/db/getDb", () => ({ getDb: vi.fn() }));
vi.mock("../../shared/db/recordJobRun", () => ({ recordJobRun: vi.fn() }));

const db = {} as BacklogDatabase;
const target = { repo: "assist", prNumber: 412 };
const startedAt = new Date("2026-11-01T00:00:00Z");

describe("recordReviewerRuns", () => {
	it("writes one row per fresh reviewer with its outcome", async () => {
		await recordReviewerRuns(
			[
				{
					name: "claude",
					model: "claude-opus",
					outputPath: "/r/claude.md",
					exitCode: 0,
					stderr: "",
					elapsedMs: 90_000,
					usage: { input: 10, output: 2, cacheRead: 5, cacheWrite: 1 },
				},
				{ name: "codex", outputPath: "/r/codex.md", exitCode: 1, stderr: "" },
			],
			target,
			startedAt,
			async () => db,
		);

		const rows = vi.mocked(recordJobRun).mock.calls.map(([, row]) => row);
		expect(rows[0]).toMatchObject({
			kind: "review",
			trigger: "manual",
			model: "claude-opus",
			durationMs: 90_000,
			finishedAt: new Date("2026-11-01T00:01:30Z"),
			inputTokens: 10,
			outputTokens: 2,
			cacheReadTokens: 5,
			cacheWriteTokens: 1,
			costUsd: null,
			status: "finished",
			repo: "assist",
			prNumber: 412,
			reviewer: "claude",
		});
		expect(rows[1]).toMatchObject({
			reviewer: "codex",
			model: null,
			status: "failed",
			detail: "exit 1",
		});
	});

	it("skips the database when nothing ran fresh", async () => {
		const openDb = vi.fn();
		await recordReviewerRuns([], target, startedAt, openDb);
		expect(openDb).not.toHaveBeenCalled();
	});
});
