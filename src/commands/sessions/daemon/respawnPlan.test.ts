import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";

vi.mock("node:crypto", () => ({ randomUUID: vi.fn(() => "fresh-uuid") }));
vi.mock("./spawnClaude", () => ({ spawnClaude: vi.fn(() => "claude-pty") }));
vi.mock("./spawnPty", () => ({ spawnPty: vi.fn(() => "assist-pty") }));
vi.mock("./spawnCodex", () => ({ spawnCodex: vi.fn(() => "codex-pty") }));

import { respawnPlan } from "./respawnPlan";
import { spawnClaude } from "./spawnClaude";
import { spawnCodex } from "./spawnCodex";
import { spawnPty } from "./spawnPty";

const mockSpawnClaude = spawnClaude as unknown as MockInstance;
const mockSpawnPty = spawnPty as unknown as MockInstance;
const mockSpawnCodex = spawnCodex as unknown as MockInstance;

describe("respawnPlan", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("for a claude session", () => {
		it("resumes the recorded conversation", () => {
			const plan = respawnPlan(
				makeSession({
					id: "1",
					commandType: "claude",
					cwd: "/repo",
					claudeSessionId: "conv-1",
				}),
			) as NonNullable<ReturnType<typeof respawnPlan>>;
			plan.spawn();

			expect(plan.status).toBe("waiting");
			expect(mockSpawnClaude).toHaveBeenCalledWith({
				resumeSessionId: "conv-1",
				cwd: "/repo",
				sessionId: "1",
			});
		});

		it("starts a fresh conversation in the cwd when none was recorded", () => {
			const plan = respawnPlan(
				makeSession({ id: "1", commandType: "claude", cwd: "/repo" }),
			);

			expect(plan?.status).toBe("waiting");
		});

		it("resumes an auto session in auto mode", () => {
			const plan = respawnPlan(
				makeSession({
					id: "1",
					commandType: "claude",
					cwd: "/repo",
					claudeSessionId: "conv-1",
					auto: true,
				}),
			) as NonNullable<ReturnType<typeof respawnPlan>>;
			plan.spawn();

			expect(mockSpawnClaude).toHaveBeenCalledWith(
				expect.objectContaining({ resumeSessionId: "conv-1", auto: true }),
			);
		});

		it("relaunches an auto session in auto mode when no conversation was recorded", () => {
			const plan = respawnPlan(
				makeSession({
					id: "1",
					commandType: "claude",
					cwd: "/repo",
					initialPrompt: "go",
					auto: true,
				}),
			) as NonNullable<ReturnType<typeof respawnPlan>>;
			plan.spawn();

			expect(mockSpawnClaude).toHaveBeenCalledWith(
				expect.objectContaining({ prompt: "go", auto: true }),
			);
		});

		it("keeps a design session's system prompt and auto mode on respawn", () => {
			const plan = respawnPlan(
				makeSession({
					id: "1",
					commandType: "claude",
					cwd: "/repo",
					claudeSessionId: "conv-1",
					design: true,
				}),
			) as NonNullable<ReturnType<typeof respawnPlan>>;
			plan.spawn();

			expect(mockSpawnClaude).toHaveBeenCalledWith(
				expect.objectContaining({ resumeSessionId: "conv-1", design: true }),
			);
		});
	});

	describe("for an interactive session on a harness that cannot resume", () => {
		it("has no plan rather than respawning it as claude", () => {
			expect(
				respawnPlan(
					makeSession({
						id: "1",
						commandType: "claude",
						cwd: "/repo",
						harness: "pi",
						initialPrompt: "/refine a279",
					}),
				),
			).toBeNull();
			expect(mockSpawnClaude).not.toHaveBeenCalled();
		});
	});

	describe("for a codex session", () => {
		it("resumes the bound codex conversation", () => {
			const plan = respawnPlan(
				makeSession({
					id: "1",
					commandType: "claude",
					cwd: "/repo",
					harness: "codex",
					harnessSessionId: "codex-conv",
				}),
			) as NonNullable<ReturnType<typeof respawnPlan>>;
			plan.spawn();

			expect(plan.status).toBe("waiting");
			expect(mockSpawnCodex).toHaveBeenCalledWith({
				resumeSessionId: "codex-conv",
				cwd: "/repo",
				sessionId: "1",
			});
			expect(mockSpawnClaude).not.toHaveBeenCalled();
		});

		it("relaunches from its prompt when no conversation was bound", () => {
			const plan = respawnPlan(
				makeSession({
					id: "1",
					commandType: "claude",
					cwd: "/repo",
					harness: "codex",
					initialPrompt: "refine a279",
				}),
			) as NonNullable<ReturnType<typeof respawnPlan>>;
			plan.spawn();

			expect(plan.status).toBe("running");
			expect(mockSpawnCodex).toHaveBeenCalledWith({
				prompt: "refine a279",
				cwd: "/repo",
				sessionId: "1",
			});
		});
	});

	describe("for an assist session on a harness that cannot resume", () => {
		it("relaunches the command without a claude resume flag", () => {
			const plan = respawnPlan(
				makeSession({
					id: "1",
					cwd: "/repo",
					commandType: "assist",
					harness: "codex",
					assistArgs: ["refine", "--once", "--harness", "codex", "a279"],
					claudeSessionId: "stale-conv",
				}),
			) as NonNullable<ReturnType<typeof respawnPlan>>;
			plan.spawn();

			expect(mockSpawnPty).toHaveBeenCalledWith(
				["assist", "refine", "--once", "--harness", "codex", "a279"],
				"/repo",
				"1",
				undefined,
			);
		});
	});

	describe("for an assist session on claude", () => {
		it("keeps resuming the recorded conversation", () => {
			const plan = respawnPlan(
				makeSession({
					id: "1",
					cwd: "/repo",
					commandType: "assist",
					assistArgs: ["draft"],
					claudeSessionId: "conv-2",
				}),
			) as NonNullable<ReturnType<typeof respawnPlan>>;
			plan.spawn();

			expect(mockSpawnPty).toHaveBeenCalledWith(
				["assist", "draft", "--resume-session", "conv-2"],
				"/repo",
				"1",
				undefined,
			);
		});
	});
});
