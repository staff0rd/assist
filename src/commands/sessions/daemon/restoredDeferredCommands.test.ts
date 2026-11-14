import { describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { persistedSessionSchema } from "./persistedSessionSchema";
import { restoreBase } from "./restoreBase";
import { toPersistedSession } from "./toPersistedSession";

vi.mock("../../backlog/consumePause", () => ({ isPausePending: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const command = {
	argv: ["ask-question", "--json", "-"],
	stdin: '{"questions":[]}',
	cwd: "/repo",
};

function persistedJson(deferredCommands: unknown) {
	return {
		name: "s",
		commandType: "claude",
		cwd: "/repo",
		startedAt: 1,
		deferredCommands,
	};
}

describe("restoredDeferredCommands", () => {
	it("round-trips pending commands' argv, stdin and cwd through sessions.json with no env", () => {
		const saved = toPersistedSession({
			id: "1",
			name: "s",
			commandType: "claude",
			cwd: "/repo",
			startedAt: 1,
			runningMs: 0,
			runningSince: null,
			deferredCommands: [command],
		} as unknown as Session);
		const json = structuredClone(saved);

		expect(json.deferredCommands).toEqual([command]);
		const loaded = persistedSessionSchema.parse(json);
		expect(restoreBase("2", loaded).deferredCommands).toEqual([command]);
	});

	it("loads a legacy label-only entry and drops it with a log line", () => {
		const parsed = persistedSessionSchema.safeParse(
			persistedJson(["ask-question", command]),
		);

		expect(parsed.success).toBe(true);
		const restored = restoreBase("3", parsed.data as never).deferredCommands;
		expect(restored).toEqual([command]);
		expect(daemonLog).toHaveBeenCalledWith(
			expect.stringContaining("defer-command ask-question dropped on restore"),
		);
	});

	it("restores no pending list when only legacy entries were saved", () => {
		const loaded = persistedSessionSchema.parse(persistedJson(["ask"]));

		expect(restoreBase("4", loaded).deferredCommands).toBeUndefined();
	});
});
