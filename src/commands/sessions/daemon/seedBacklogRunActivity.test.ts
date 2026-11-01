import { beforeEach, describe, expect, it, vi } from "vitest";
import { reconcileActivity } from "../../../shared/emitActivity";
import type { Session } from "./createSession";
import { createAssistSession } from "./createAssistSession";
import { loadProvisionalRunActivity } from "./loadProvisionalRunActivity";
import { seedBacklogRunActivity } from "./seedBacklogRunActivity";

vi.mock("../../../shared/emitActivity", () => ({
	activityPath: (id: string) => `/nonexistent/activity-${id}.json`,
	reconcileActivity: vi.fn(),
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
	});

	it("gives a held backlog run its activity before its pty starts", async () => {
		const { sessions, session } = held(["backlog", "run", "a825"]);
		const notify = vi.fn();

		await seedBacklogRunActivity(sessions, session, notify);

		expect(session.pty).toBeNull();
		expect(session.pendingStart).toBeDefined();
		expect(loadProvisionalRunActivity).toHaveBeenCalledWith(825);
		expect(session.activity).toMatchObject(provisional);
		expect(reconcileActivity).toHaveBeenCalledWith(
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
});
