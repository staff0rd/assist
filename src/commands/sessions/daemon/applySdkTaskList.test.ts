import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { applySdkTaskList } from "./applySdkTaskList";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const background = (tasks: string[]) =>
	({ kind: "background", tasks }) as Parameters<typeof applySdkTaskList>[1];

describe("applySdkTaskList", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(20 * 60_000);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("restarts the idle clock when the last background task ends while waiting", () => {
		const session = makeSession({
			status: "waiting",
			waitingSince: 0,
			sdkBackgroundTasks: ["live check"],
		});
		applySdkTaskList(session, background([]));
		expect(session.sdkBackgroundTasks).toBeUndefined();
		expect(session.waitingSince).toBe(20 * 60_000);
	});

	it("keeps the idle clock while a background task is still running", () => {
		const session = makeSession({
			status: "waiting",
			waitingSince: 0,
			sdkBackgroundTasks: ["a", "b"],
		});
		applySdkTaskList(session, background(["b"]));
		expect(session.waitingSince).toBe(0);
	});

	it("keeps the idle clock when no background task was running", () => {
		const session = makeSession({ status: "waiting", waitingSince: 0 });
		applySdkTaskList(session, background([]));
		expect(session.waitingSince).toBe(0);
	});

	it("leaves a running session's clock unset", () => {
		const session = makeSession({ sdkBackgroundTasks: ["a"] });
		applySdkTaskList(session, background([]));
		expect(session.waitingSince).toBeNull();
	});
});
