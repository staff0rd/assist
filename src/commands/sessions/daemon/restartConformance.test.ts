import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HarnessKind } from "../../../shared/harnesses";
import { makeSession } from "../../../test/mothers/makeSession";

vi.mock("./spawnClaude", () => ({ spawnClaude: vi.fn(() => "claude-pty") }));
vi.mock("./spawnCodex", () => ({ spawnCodex: vi.fn(() => "codex-pty") }));
vi.mock("./spawnPty", () => ({ spawnPty: vi.fn(() => "assist-pty") }));
vi.mock("./hasTranscriptOnDisk", () => ({ hasTranscriptOnDisk: () => true }));
vi.mock("../shared/codex/hasCodexRolloutSync", () => ({
	hasCodexRolloutSync: () => true,
}));

import { respawnPlan } from "./respawnPlan";
import { spawnClaude } from "./spawnClaude";
import { spawnCodex } from "./spawnCodex";
import { spawnPty } from "./spawnPty";

type Fixture = {
	harness: HarnessKind;
	identity: { claudeSessionId?: string; harnessSessionId?: string };
	wrappedResume: { id: string } | { reason: string };
	wrappedResumeArgs: string[];
	direct: "claude" | "codex" | "none";
};

const fixtures: Fixture[] = [
	{
		harness: "claude",
		identity: { claudeSessionId: "conv-1" },
		wrappedResume: { id: "conv-1" },
		wrappedResumeArgs: ["--resume-session", "conv-1"],
		direct: "claude",
	},
	{
		harness: "codex",
		identity: { harnessSessionId: "conv-1" },
		wrappedResume: { id: "conv-1" },
		wrappedResumeArgs: ["--resume-session", "conv-1"],
		direct: "codex",
	},
	{
		harness: "pi",
		identity: {},
		wrappedResume: { reason: "pi sessions cannot be resumed yet" },
		wrappedResumeArgs: [],
		direct: "none",
	},
];

const wrappedCommands: [string, (harness: HarnessKind) => string[]][] = [
	["refine", (harness) => ["refine", "--once", "--harness", harness, "a42"]],
	[
		"fix-conflict",
		(harness) => ["fix-conflict", "--rebase", "--harness", harness, "7"],
	],
	[
		"review-pr-comments",
		(harness) => ["review-pr-comments", "--auto", "--harness", harness, "7"],
	],
];

describe.each(fixtures)("restart conformance on $harness", (fixture) => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it.each(wrappedCommands)(
		"restarts a wrapped %s session with the explicit harness, resuming only when the adapter can",
		(_name, assistArgs) => {
			const plan = respawnPlan(
				makeSession({
					id: "s1",
					commandType: "assist",
					cwd: "/repo",
					harness: fixture.harness,
					assistArgs: assistArgs(fixture.harness),
					...fixture.identity,
				}),
			);

			plan?.spawn();

			expect(vi.mocked(spawnPty).mock.calls[0][0]).toEqual([
				"assist",
				...assistArgs(fixture.harness),
				...fixture.wrappedResumeArgs,
			]);
			expect(plan?.resumeOutcome?.()).toEqual(fixture.wrappedResume);
		},
	);

	it("restarts a direct session through its own harness, or not at all when it cannot resume", () => {
		const plan = respawnPlan(
			makeSession({
				id: "s1",
				commandType: "claude",
				cwd: "/repo",
				harness: fixture.harness,
				...fixture.identity,
			}),
		);

		if (fixture.direct === "none") {
			expect(plan).toBeNull();
			return;
		}
		plan?.spawn();
		const resumed = { claude: spawnClaude, codex: spawnCodex }[fixture.direct];
		expect(vi.mocked(resumed)).toHaveBeenCalledWith(
			expect.objectContaining({ resumeSessionId: "conv-1" }),
		);
	});
});
