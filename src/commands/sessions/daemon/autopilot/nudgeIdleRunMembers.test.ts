import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import { applySdkTaskList } from "../applySdkTaskList";
import type { Session } from "../types";
import type { AutopilotDeps, AutopilotIdleMember } from "./AutopilotDeps";
import type { AutopilotStarted } from "./AutopilotStarted";
import { autopilotIdleMembers } from "./autopilotIdleMembers";
import {
	type AutopilotStore,
	createAutopilotStore,
} from "./createAutopilotStore";
import { nudgeIdleRunMembers } from "./nudgeIdleRunMembers";

vi.mock("../daemonLog", () => ({ daemonLog: () => {} }));

describe("nudgeIdleRunMembers", () => {
	let dir: string;
	let store: AutopilotStore;
	let started: AutopilotStarted;
	let idle: AutopilotIdleMember[];
	let prompted: string[];
	let notified: string[];

	const review = (waitingSince: number): AutopilotIdleMember => ({
		sessionId: "b1",
		waitingSince,
		itemId: 1881,
		phase: "Review",
		lastMessage: "All 8 checks pass.\n\nShould I mark a1881 done?",
	});
	const nudge = () => nudgeIdleRunMembers(store, started, "/repo");

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(10 * 60_000);
		dir = mkdtempSync(join(tmpdir(), "autopilot-nudge-"));
		store = createAutopilotStore(join(dir, "autopilot.json"));
		store.update("/repo", (repo) => {
			repo.current = { sessionId: "s1", startedAt: "2026-01-01T00:00:00Z" };
		});
		idle = [];
		prompted = [];
		notified = [];
		const deps = {
			idleMembers: (rootId: string) => (rootId === "s1" ? idle : []),
			promptSession: (id: string) => {
				prompted.push(id);
				return true;
			},
			notify: (title: string, message: string) =>
				notified.push(`${title}: ${message}`),
		} as unknown as AutopilotDeps;
		started = { deps, nudges: new Map() } as unknown as AutopilotStarted;
	});

	afterEach(() => {
		vi.useRealTimers();
		rmSync(dir, { recursive: true, force: true });
	});

	it("leaves a session that only just went idle", () => {
		idle = [review(9 * 60_000)];
		nudge();
		expect(prompted).toEqual([]);
	});

	it("answers a Review session idle on a chat question, once per idle stretch", () => {
		idle = [review(0)];
		nudge();
		nudge();
		expect(prompted).toEqual(["b1"]);
		expect(store.repo("/repo").paused).toBe(false);
	});

	it("pauses and notifies once answering stops helping", () => {
		idle = [review(0)];
		nudge();
		idle = [review(60_000)];
		nudge();
		idle = [review(2 * 60_000)];
		nudge();
		expect(prompted).toEqual(["b1", "b1"]);
		expect(store.repo("/repo")).toMatchObject({
			paused: true,
			failure: {
				item: "a1881",
				phase: "Review",
				sessionId: "b1",
				reason:
					'its session is waiting for a chat reply autopilot cannot give: "Should I mark a1881 done?"',
			},
		});
		expect(notified).toHaveLength(1);
	});

	it("leaves a session waiting on its own background task, then counts idle from when it ends", () => {
		const member = makeSession({
			id: "b1",
			autopilot: "s1",
			status: "waiting",
			waitingSince: 0,
			sdkBackgroundTasks: ["15-minute live check"],
		});
		const sessions: Session[] = [member];
		started.deps.idleMembers = (rootId) =>
			autopilotIdleMembers(sessions, rootId);
		for (let tick = 0; tick < 4; tick++) {
			vi.advanceTimersByTime(3 * 60_000);
			nudge();
		}
		expect(prompted).toEqual([]);
		expect(store.repo("/repo").paused).toBe(false);
		expect(notified).toEqual([]);

		applySdkTaskList(member, { kind: "background", tasks: [] });
		nudge();
		expect(prompted).toEqual([]);
		vi.advanceTimersByTime(2 * 60_000);
		nudge();
		expect(prompted).toEqual(["b1"]);
	});

	it("does nothing while the schedule is paused or no run is current", () => {
		idle = [review(0)];
		store.update("/repo", (repo) => {
			repo.paused = true;
		});
		nudge();
		store.update("/repo", (repo) => {
			repo.paused = false;
			repo.current = undefined;
		});
		nudge();
		expect(prompted).toEqual([]);
	});
});
