import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import { applySdkTaskList } from "../applySdkTaskList";
import type { Session } from "../types";
import type { AutopilotDeps } from "./AutopilotDeps";
import type { AutopilotStarted } from "./AutopilotStarted";
import { autopilotBackgroundHolds } from "./autopilotBackgroundHolds";
import { autopilotIdleMembers } from "./autopilotIdleMembers";
import { autopilotRunState } from "./autopilotRunState";
import { createAutopilotRuns } from "./createAutopilotRuns";
import {
	type AutopilotStore,
	createAutopilotStore,
} from "./createAutopilotStore";
import { nudgeIdleRunMembers } from "./nudgeIdleRunMembers";
import { tickAutopilotRepo } from "./tickAutopilotRepo";

const logs: string[] = [];
vi.mock("../daemonLog", () => ({
	daemonLog: (line: string) => logs.push(line),
}));

const target = {
	cwd: "/repo",
	prompt: "/helm",
	intervalMinutes: 60,
	scheduledHere: true,
};
const at = (time: string) => vi.setSystemTime(new Date(time));

describe("autopilot tick held by a background wait", () => {
	let dir: string;
	let store: AutopilotStore;
	let started: AutopilotStarted;
	let sessions: Session[];
	let prompts: { id: string; text: string }[];
	let launched: string[];
	let canPrompt: boolean;
	let member: Session;
	const memberPrompts = () => prompts.filter((p) => p.id === "15");

	const find = (id: string) => sessions.find((s) => s.id === id);
	const run = (rootId: string) =>
		sessions.filter((s) => s.autopilot === rootId);
	const tick = () => {
		nudgeIdleRunMembers(store, started, target.cwd);
		tickAutopilotRepo(store, started, target);
	};
	const startWait = (time: string) => {
		at(time);
		member.status = "waiting";
		member.waitingSince = Date.now();
		applySdkTaskList(member, { kind: "background", tasks: ["sleep loop"] });
	};
	const finish = () => {
		applySdkTaskList(member, { kind: "background", tasks: [] });
		member.status = "done";
	};

	beforeEach(() => {
		vi.useFakeTimers();
		logs.length = 0;
		dir = mkdtempSync(join(tmpdir(), "autopilot-handoff-"));
		store = createAutopilotStore(join(dir, "autopilot.json"));
		at("2026-11-24T18:55:56Z");
		store.addTick(
			target.cwd,
			{ outcome: "launched", trigger: "scheduled", sessionId: "14" },
			(repo) => {
				repo.current = {
					sessionId: "14",
					startedAt: new Date().toISOString(),
				};
			},
		);
		const root = makeSession({
			id: "14",
			autopilot: "14",
			status: "waiting",
			waitingSince: Date.now(),
		});
		member = makeSession({
			id: "15",
			autopilot: "14",
			launchedFrom: "14",
			activity: { itemId: 1921, phase: 1 } as Session["activity"],
		});
		sessions = [root, member];
		prompts = [];
		launched = [];
		canPrompt = true;
		const deps = {
			localNode: () => "mac",
			sessionState: (id: string) => autopilotRunState(find(id), run(id)),
			sessionLink: (id: string) => ({
				launchedFrom: find(id)?.launchedFrom,
				itemId: find(id)?.activity?.itemId,
			}),
			runItems: () => [],
			idleMembers: (rootId: string) => autopilotIdleMembers(sessions, rootId),
			backgroundHolds: (rootId: string) =>
				autopilotBackgroundHolds(find(rootId), run(rootId), Date.now()),
			promptSession: (id: string, text: string) => {
				prompts.push({ id, text });
				return canPrompt;
			},
			launch: () => {
				const id = `run-${launched.length + 1}`;
				launched.push(id);
				return id;
			},
			notify: () => {},
		} as unknown as AutopilotDeps;
		started = {
			deps,
			runs: createAutopilotRuns(store, deps),
			nudges: new Map(),
		} as unknown as AutopilotStarted;
	});

	afterEach(() => {
		vi.useRealTimers();
		rmSync(dir, { recursive: true, force: true });
	});

	it("leaves a wait that ends before the next tick alone", () => {
		startWait("2026-11-24T19:20:03Z");
		at("2026-11-24T19:40:00Z");
		tick();
		applySdkTaskList(member, { kind: "background", tasks: [] });
		member.status = "running";
		at("2026-11-24T19:45:00Z");
		finish();
		tick();
		expect(memberPrompts()).toEqual([]);
		at("2026-11-24T19:56:00Z");
		tick();
		expect(launched).toEqual(["run-1"]);
		expect(store.repo(target.cwd).paused).toBe(false);
	});

	it("hands a wait that outlasts the tick off to the next tick", () => {
		startWait("2026-11-24T19:20:03Z");
		at("2026-11-24T19:56:00Z");
		tick();
		expect(launched).toEqual([]);
		expect(prompts.map((p) => p.id)).toEqual(["15"]);
		const [{ text }] = prompts;
		expect(text).toContain("running 36m");
		expect(text).toContain("The next tick runs at 2026-11-24T20:56:00.000Z");
		expect(text).toContain('assist backlog comment a1921 "Check at <time>');
		expect(text).toContain("finish the item and end");
		expect(store.repo(target.cwd).ticks.at(-1)).toMatchObject({
			outcome: "skipped",
			sessionId: "14",
			reason:
				"run held by a background wait (15 task age 36m); asked it to hand its check to the next tick",
		});
		expect(store.repo(target.cwd).paused).toBe(false);
		expect(logs).toContain(
			"autopilot: /repo tick held by 15 on a background task (age 36m); sent hand-off for the tick at 2026-11-24T20:56:00.000Z",
		);
	});

	it("pauses when the member still holds the run at the following tick", () => {
		startWait("2026-11-24T19:20:03Z");
		at("2026-11-24T19:56:00Z");
		tick();
		member.status = "running";
		startWait("2026-11-24T19:57:00Z");
		at("2026-11-24T20:30:00Z");
		tick();
		expect(store.repo(target.cwd).paused).toBe(false);
		at("2026-11-24T20:56:00Z");
		tick();
		expect(launched).toEqual([]);
		expect(prompts.map((p) => p.id)).toEqual(["15"]);
		expect(store.repo(target.cwd)).toMatchObject({
			paused: true,
			failure: {
				item: "a1921",
				sessionId: "15",
				reason:
					"its session kept the run open on a background task (running 1h36m) after autopilot asked it to hand its check to the next tick",
			},
		});
	});

	it("pauses when the held member can't take the hand-off", () => {
		canPrompt = false;
		startWait("2026-11-24T19:20:03Z");
		at("2026-11-24T19:56:00Z");
		tick();
		expect(store.repo(target.cwd).failure?.reason).toBe(
			"its session holds the run open on a background task (running 36m) and could not take autopilot's hand-off prompt",
		);
	});

	it("skips as before when the run is held by more than a background wait", () => {
		startWait("2026-11-24T19:20:03Z");
		sessions.push(
			makeSession({ id: "16", autopilot: "14", status: "running" }),
		);
		at("2026-11-24T19:56:00Z");
		tick();
		expect(prompts).toEqual([]);
		expect(store.repo(target.cwd).ticks.at(-1)?.reason).toBe("14 still live");
	});

	it("leaves a non-autopilot session waiting on a background task alone", () => {
		member.autopilot = undefined;
		store.update(target.cwd, (repo) => {
			if (repo.current)
				repo.current.summary = {
					checked: "",
					decided: "",
					started: "",
					next: "",
				};
		});
		startWait("2026-11-24T19:20:03Z");
		at("2026-11-24T19:56:00Z");
		tick();
		expect(memberPrompts()).toEqual([]);
		expect(launched).toEqual(["run-1"]);
	});

	it("replays session 15: hands the 22:16Z check off and the next tick launches", () => {
		started.nudges.set("15", { waitingSince: 0, count: 2 });
		startWait("2026-11-24T19:20:03Z");
		at("2026-11-24T19:55:56Z");
		tick();
		expect(prompts.map((p) => p.id)).toEqual(["15"]);
		member.status = "running";
		finish();
		for (const time of ["19:57:00", "20:10:00", "20:40:00", "20:55:56"]) {
			at(`2026-11-24T${time}Z`);
			tick();
		}
		expect(launched).toEqual(["run-1"]);
		expect(store.repo(target.cwd).paused).toBe(false);
		expect(logs.some((line) => line.includes("still live"))).toBe(false);
	});
});
