import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import type * as fsMockModule from "../../../test/mocks/fsMock";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../../test/mocks/fsMock")
	).fsMock(),
);

vi.mock("../../../shared/emitActivity", () => ({
	activityPath: (id: string) => `/activity/activity-${id}.json`,
	readActivity: vi.fn(),
	reconcileActivity: vi.fn(),
}));

import { existsSync, watch } from "node:fs";
import { readActivity, reconcileActivity } from "../../../shared/emitActivity";
import { refreshActivity, watchActivity } from "./watchActivity";

const mockWatch = vi.mocked(watch);

beforeEach(() => {
	vi.mocked(existsSync).mockReturnValue(false);
	mockWatch.mockImplementation((() => ({ close: vi.fn() })) as never);
});
const mockReadActivity = readActivity as unknown as MockInstance;
const mockReconcileActivity = reconcileActivity as unknown as MockInstance;

const assistSession = {
	id: "1",
	commandType: "assist",
	cwd: "/repo",
} satisfies Partial<Session>;

const backlogActivity = {
	kind: "backlog" as const,
	itemId: 7,
	phase: 2,
	claudeSessionId: "phase-2-id",
	startedAt: 5,
};

describe("watchActivity", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("copies the reported claude session id onto the session and notifies", () => {
		mockReadActivity.mockReturnValue(backlogActivity);
		const session = makeSession(assistSession);
		const notify = vi.fn();

		watchActivity(session, notify);
		const onChange = mockWatch.mock.lastCall?.[1] as (
			event: string,
			filename: string,
		) => void;
		onChange("change", "activity-1.json");
		vi.runAllTimers();

		expect(session.claudeSessionId).toBe("phase-2-id");
		expect(session.activity).toEqual(backlogActivity);
		expect(notify).toHaveBeenCalled();
	});

	function triggerRead(session: Session, notify = vi.fn()) {
		watchActivity(session, notify);
		const onChange = mockWatch.mock.lastCall?.[1] as (
			event: string,
			filename: string,
		) => void;
		onChange("change", "activity-1.json");
		vi.runAllTimers();
	}

	describe("when a backlog run enters its review (last) phase", () => {
		it("flips Continue off and marks reviewStarted", () => {
			mockReadActivity.mockReturnValue({
				kind: "backlog",
				itemId: 7,
				phase: 3,
				totalPhases: 3,
				startedAt: 5,
			});
			const session = makeSession({ ...assistSession, autoAdvance: true });

			triggerRead(session);

			expect(session.autoAdvance).toBe(false);
			expect(session.reviewStarted).toBe(true);
		});

		describe("when the user re-enables Continue during review", () => {
			it("does not override it on a later activity write", () => {
				const reviewActivity = {
					kind: "backlog" as const,
					itemId: 7,
					phase: 3,
					totalPhases: 3,
					startedAt: 5,
				};
				mockReadActivity.mockReturnValue(reviewActivity);
				const session = makeSession({ ...assistSession, autoAdvance: true });
				triggerRead(session);
				expect(session.autoAdvance).toBe(false);

				session.autoAdvance = true;
				triggerRead(session);

				expect(session.autoAdvance).toBe(true);
			});
		});

		describe("when the review phase re-enters after a rewind", () => {
			it("re-flips Continue off", () => {
				const session = makeSession({ ...assistSession, autoAdvance: true });

				mockReadActivity.mockReturnValue({
					kind: "backlog",
					itemId: 7,
					phase: 3,
					totalPhases: 3,
					startedAt: 5,
				});
				triggerRead(session);

				mockReadActivity.mockReturnValue({
					kind: "backlog",
					itemId: 7,
					phase: 2,
					totalPhases: 3,
					startedAt: 5,
				});
				session.autoAdvance = true;
				triggerRead(session);
				expect(session.reviewStarted).toBe(false);

				mockReadActivity.mockReturnValue({
					kind: "backlog",
					itemId: 7,
					phase: 3,
					totalPhases: 3,
					startedAt: 5,
				});
				triggerRead(session);

				expect(session.autoAdvance).toBe(false);
				expect(session.reviewStarted).toBe(true);
			});
		});
	});

	describe("when a backlog run is in a non-review phase", () => {
		it("leaves Continue alone", () => {
			mockReadActivity.mockReturnValue({
				kind: "backlog",
				itemId: 7,
				phase: 1,
				totalPhases: 3,
				startedAt: 5,
			});
			const session = makeSession({ ...assistSession, autoAdvance: true });

			triggerRead(session);

			expect(session.autoAdvance).toBe(true);
			expect(session.reviewStarted).toBeUndefined();
		});
	});

	describe("when the launched command reports a non-claude harness", () => {
		it("copies the harness onto the session so the card badges it", () => {
			mockReadActivity.mockReturnValue({
				kind: "command",
				name: "refine a279",
				harness: "codex",
				startedAt: 5,
			});
			const session = makeSession(assistSession);

			triggerRead(session);

			expect(session.harness).toBe("codex");
			expect(session.claudeSessionId).toBeUndefined();
		});
	});

	describe("when the activity reports no harness", () => {
		it("leaves the harness absent so consumers fall back to claude", () => {
			mockReadActivity.mockReturnValue(backlogActivity);
			const session = makeSession(assistSession);

			triggerRead(session);

			expect(session.harness).toBeUndefined();
		});
	});

	describe("when the session was restored", () => {
		it("reconciles the reused id's activity file with the session's own activity", () => {
			const session = makeSession({
				...assistSession,
				restored: true,
				activity: backlogActivity,
			});

			watchActivity(session, vi.fn());

			expect(mockReconcileActivity).toHaveBeenCalledWith("1", backlogActivity);
		});
	});

	describe("when a fresh (non-restored) session reuses an id", () => {
		it("clears the stale activity file so a prior backlog item's chip does not leak", () => {
			watchActivity(
				makeSession({ ...assistSession, activity: undefined }),
				vi.fn(),
			);

			expect(mockReconcileActivity).toHaveBeenCalledWith("1", undefined);
		});
	});
});

describe("refreshActivity", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("loads the latest reported claude session id synchronously", () => {
		mockReadActivity.mockReturnValue(backlogActivity);
		const session = makeSession(assistSession);

		refreshActivity(session);

		expect(session.claudeSessionId).toBe("phase-2-id");
		expect(session.activity).toEqual(backlogActivity);
	});

	it("loads the reported harness synchronously", () => {
		mockReadActivity.mockReturnValue({
			kind: "command",
			name: "refine a279",
			harness: "codex",
			startedAt: 5,
		});
		const session = makeSession(assistSession);

		refreshActivity(session);

		expect(session.harness).toBe("codex");
	});

	it("leaves the session untouched when there is no activity", () => {
		mockReadActivity.mockReturnValue(undefined);
		const session = makeSession({
			...assistSession,
			claudeSessionId: "existing",
		});

		refreshActivity(session);

		expect(session.claudeSessionId).toBe("existing");
	});
});
