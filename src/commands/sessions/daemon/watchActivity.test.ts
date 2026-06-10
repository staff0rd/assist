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
}));

import { watch } from "node:fs";
import { readActivity } from "../../../shared/emitActivity";
import { refreshActivity, watchActivity } from "./watchActivity";

const mockWatch = watch as unknown as MockInstance;
const mockReadActivity = readActivity as unknown as MockInstance;

function fakeSession(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "s",
		commandType: "assist",
		status: "running",
		startedAt: 1,
		pty: {} as Session["pty"],
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
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
