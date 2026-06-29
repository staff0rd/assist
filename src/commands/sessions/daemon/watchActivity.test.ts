import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import type { Session } from "./createSession";

vi.mock("node:fs", () => ({
	existsSync: vi.fn(() => false),
	mkdirSync: vi.fn(),
	watch: vi.fn(() => ({ close: vi.fn() })),
}));

vi.mock("../../../shared/emitActivity", () => ({
	activityPath: (id: string) => `/activity/activity-${id}.json`,
	readActivity: vi.fn(),
	reconcileActivity: vi.fn(),
}));

import { watch } from "node:fs";
import { readActivity, reconcileActivity } from "../../../shared/emitActivity";
import { refreshActivity, watchActivity } from "./watchActivity";

const mockWatch = watch as unknown as MockInstance;
const mockReadActivity = readActivity as unknown as MockInstance;
const mockReconcileActivity = reconcileActivity as unknown as MockInstance;

function fakeSession(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "s",
		commandType: "assist",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		pty: {} as Session["pty"],
		scrollback: "",
		cwd: "/repo",
		...overrides,
	};
}

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
		const session = fakeSession();
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
			const session = fakeSession({ autoAdvance: true });

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
				const session = fakeSession({ autoAdvance: true });
				triggerRead(session);
				expect(session.autoAdvance).toBe(false);

				session.autoAdvance = true;
				triggerRead(session);

				expect(session.autoAdvance).toBe(true);
			});
		});

		describe("when the review phase re-enters after a rewind", () => {
			it("re-flips Continue off", () => {
				const session = fakeSession({ autoAdvance: true });

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
			const session = fakeSession({ autoAdvance: true });

			triggerRead(session);

			expect(session.autoAdvance).toBe(true);
			expect(session.reviewStarted).toBeUndefined();
		});
	});

	describe("when the session was restored", () => {
		it("reconciles the reused id's activity file with the session's own activity", () => {
			const session = fakeSession({
				restored: true,
				activity: backlogActivity,
			});

			watchActivity(session, vi.fn());

			expect(mockReconcileActivity).toHaveBeenCalledWith("1", backlogActivity);
		});
	});

	describe("when a fresh (non-restored) session reuses an id", () => {
		it("clears the stale activity file so a prior backlog item's chip does not leak", () => {
			watchActivity(fakeSession({ activity: undefined }), vi.fn());

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
		const session = fakeSession();

		refreshActivity(session);

		expect(session.claudeSessionId).toBe("phase-2-id");
		expect(session.activity).toEqual(backlogActivity);
	});

	it("leaves the session untouched when there is no activity", () => {
		mockReadActivity.mockReturnValue(undefined);
		const session = fakeSession({ claudeSessionId: "existing" });

		refreshActivity(session);

		expect(session.claudeSessionId).toBe("existing");
	});
});
