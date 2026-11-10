import { beforeEach, describe, expect, it, vi } from "vitest";
import { writeActivityIfAbsent } from "../../../shared/emitActivity";
import type { Session } from "./createSession";
import { createAssistSession } from "./createAssistSession";
import { daemonLog } from "./daemonLog";
import { loadProvisionalRunActivity } from "./loadProvisionalRunActivity";
import { seedBacklogRunActivity } from "./seedBacklogRunActivity";

vi.mock("../../../shared/emitActivity", () => ({
	writeActivityIfAbsent: vi.fn(),
}));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./spawnPty", () => ({ spawnPty: vi.fn() }));
vi.mock("./loadProvisionalRunActivity", () => ({
	loadProvisionalRunActivity: vi.fn(),
}));

const provisional = {
	kind: "backlog" as const,
	itemId: 825,
	itemName: "Story",
	phase: 1,
	phaseName: "Build API",
	totalPhases: 3,
};

let nextId = 100;
function held(args: string[]): {
	sessions: Map<string, Session>;
	session: Session;
} {
	const session = createAssistSession(
		String(nextId++),
		args,
		"/git/repo",
		undefined,
		true,
	);
	return { sessions: new Map([[session.id, session]]), session };
}

describe("seedBacklogRunActivity", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(loadProvisionalRunActivity).mockResolvedValue(provisional);
		vi.mocked(writeActivityIfAbsent).mockReturnValue(true);
	});

	it("gives a held backlog run its activity before its pty starts", async () => {
		const { sessions, session } = held(["backlog", "run", "a825"]);
		const notify = vi.fn();

		await seedBacklogRunActivity(sessions, session, notify);

		expect(session.pty).toBeNull();
		expect(session.pendingStart).toBeDefined();
		expect(loadProvisionalRunActivity).toHaveBeenCalledWith(825, session.cwd);
		expect(session.activity).toMatchObject(provisional);
		expect(writeActivityIfAbsent).toHaveBeenCalledWith(
			session.id,
			session.activity,
		);
		expect(notify).toHaveBeenCalled();
	});

	it("leaves non-run assist sessions untouched", async () => {
		const { sessions, session } = held(["review", "42"]);

		await seedBacklogRunActivity(sessions, session, vi.fn());

		expect(loadProvisionalRunActivity).not.toHaveBeenCalled();
		expect(session.activity).toBeUndefined();
	});

	it("keeps activity the child already reported", async () => {
		const { sessions, session } = held(["backlog", "run", "825"]);
		const reported = { ...provisional, phase: 2, startedAt: 1 };
		session.activity = reported;

		await seedBacklogRunActivity(sessions, session, vi.fn());

		expect(session.activity).toBe(reported);
	});

	it("does nothing when the lookup finds no activity", async () => {
		vi.mocked(loadProvisionalRunActivity).mockResolvedValue(undefined);
		const { sessions, session } = held(["backlog", "run", "a825"]);
		const notify = vi.fn();

		await seedBacklogRunActivity(sessions, session, notify);

		expect(session.activity).toBeUndefined();
		expect(notify).not.toHaveBeenCalled();
	});

	it("skips a session dismissed during the lookup", async () => {
		const { session } = held(["backlog", "run", "a825"]);

		await seedBacklogRunActivity(new Map(), session, vi.fn());

		expect(session.activity).toBeUndefined();
	});

	it("lets the child's activity file win when it lands during the lookup", async () => {
		vi.mocked(writeActivityIfAbsent).mockReturnValue(false);
		const { sessions, session } = held(["backlog", "run", "a825"]);
		const notify = vi.fn();

		await seedBacklogRunActivity(sessions, session, notify);

		expect(session.activity).toBeUndefined();
		expect(notify).not.toHaveBeenCalled();
		expect(daemonLog).toHaveBeenCalledWith(
			`session ${session.id} provisional activity skipped: child already reported`,
		);
	});

	it("keeps the child's activity applied while the lookup was pending", async () => {
		let resolve!: (value: typeof provisional) => void;
		vi.mocked(loadProvisionalRunActivity).mockReturnValue(
			new Promise((r) => {
				resolve = r;
			}),
		);
		const { sessions, session } = held(["backlog", "run", "a825"]);
		const pending = seedBacklogRunActivity(sessions, session, vi.fn());
		const reported = {
			...provisional,
			claudeSessionId: "child",
			startedAt: Date.now(),
		};
		session.activity = reported;

		resolve(provisional);
		await pending;

		expect(session.activity).toBe(reported);
		expect(writeActivityIfAbsent).not.toHaveBeenCalled();
	});

	it("logs instead of throwing when writing the activity fails", async () => {
		vi.mocked(writeActivityIfAbsent).mockImplementation(() => {
			throw new Error("EACCES");
		});
		const { sessions, session } = held(["backlog", "run", "a825"]);

		await expect(
			seedBacklogRunActivity(sessions, session, vi.fn()),
		).resolves.toBeUndefined();

		expect(session.activity).toBeUndefined();
		expect(session.pendingStart).toBeDefined();
		expect(daemonLog).toHaveBeenCalledWith(
			`session ${session.id} provisional activity failed: Error: EACCES`,
		);
	});
});
