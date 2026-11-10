import { describe, expect, it, vi } from "vitest";
import type { SessionManager } from "./SessionManager";
import { spawnCreate } from "./spawnCreate";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const detection = vi.hoisted(() => ({ missing: new Set<string>() }));
vi.mock("../../../shared/harnessAdapters/detectHarness", () => ({
	detectHarness: (kind: string) =>
		detection.missing.has(kind)
			? {
					supported: false,
					reason: `${kind} is not installed`,
					remediation: `install ${kind}`,
				}
			: { supported: true },
}));

function manager(joined: { sessionId: string } | { reason: string }) {
	return {
		spawn: vi.fn(() => "9"),
		addAgent: vi.fn(() => joined),
	} as unknown as SessionManager & {
		spawn: ReturnType<typeof vi.fn>;
		addAgent: ReturnType<typeof vi.fn>;
	};
}

describe("spawnCreate", () => {
	it("starts a fresh isolated session by default", () => {
		const m = manager({ reason: "no such session" });

		expect(spawnCreate(m, { prompt: "go", cwd: "/git/repo" })).toBe("9");
		expect(m.addAgent).not.toHaveBeenCalled();
		expect(m.spawn).toHaveBeenCalledWith(
			{
				prompt: "go",
				cwd: "/git/repo",
				design: false,
				auto: false,
				harness: undefined,
				inPlace: false,
			},
			{ launchedFrom: undefined },
		);
	});

	it("carries the dialog's chosen model through to the spawn request", () => {
		const m = manager({ reason: "no such session" });

		spawnCreate(m, { cwd: "/git/repo", harness: "claude", model: "opus" });

		expect(m.spawn).toHaveBeenCalledWith(
			expect.objectContaining({ harness: "claude", model: "opus" }),
			{ launchedFrom: undefined },
		);
	});

	it("carries the prompt dropdown's auto mode through to the spawn request", () => {
		const m = manager({ reason: "no such session" });

		spawnCreate(m, { prompt: "go", cwd: "/git/repo", auto: true });

		expect(m.spawn).toHaveBeenCalledWith(
			expect.objectContaining({ auto: true }),
			{ launchedFrom: undefined },
		);
	});

	it("adds an agent to the named stream instead of allocating a workspace", () => {
		const m = manager({ sessionId: "4" });

		const id = spawnCreate(m, {
			prompt: "go",
			cwd: "/git/repo-2",
			joinSessionId: "3",
		});

		expect(id).toBe("4");
		expect(m.addAgent).toHaveBeenCalledWith("3", {
			prompt: "go",
			harness: undefined,
			auto: false,
		});
		expect(m.spawn).not.toHaveBeenCalled();
	});

	it("carries the add agent dropdown's auto mode through to the join", () => {
		const m = manager({ sessionId: "4" });

		spawnCreate(m, {
			prompt: "go",
			cwd: "/git/repo-2",
			joinSessionId: "3",
			auto: true,
		});

		expect(m.addAgent).toHaveBeenCalledWith(
			"3",
			expect.objectContaining({ auto: true }),
		);
	});

	it("reports a refused join instead of spawning somewhere else", () => {
		const m = manager({ reason: "the session's workspace no longer exists" });

		expect(
			spawnCreate(m, { prompt: "go", cwd: "/git/repo-2", joinSessionId: "3" }),
		).toEqual({
			error: "Can't add an agent: the session's workspace no longer exists.",
		});
		expect(m.spawn).not.toHaveBeenCalled();
	});

	it("ignores the join target for a design session", () => {
		const m = manager({ reason: "no such session" });

		expect(
			spawnCreate(m, { cwd: "/git/repo", joinSessionId: "3", design: true }),
		).toBe("9");
		expect(m.addAgent).not.toHaveBeenCalled();
	});

	it("refuses an undetected harness before spawning, without falling back", () => {
		detection.missing.add("codex");
		const m = manager({ reason: "no such session" });

		const result = spawnCreate(m, { prompt: "go", harness: "codex" });

		expect(result).toEqual({
			error: expect.stringContaining("A new session is unavailable on Codex"),
		});
		expect(m.spawn).not.toHaveBeenCalled();
		expect(m.addAgent).not.toHaveBeenCalled();
		detection.missing.clear();
	});

	it("starts a Codex session with Claude absent", () => {
		detection.missing.add("claude");
		const m = manager({ reason: "no such session" });

		expect(spawnCreate(m, { prompt: "go", harness: "codex" })).toBe("9");
		detection.missing.clear();
	});
});
