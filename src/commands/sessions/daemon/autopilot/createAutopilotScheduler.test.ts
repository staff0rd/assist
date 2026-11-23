import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AutopilotRunItem } from "./AutopilotDeps";
import type { AutopilotRecord } from "./AutopilotRecord";
import type { AutopilotSessionState } from "./autopilotSessionState";
import { createAutopilotScheduler } from "./createAutopilotScheduler";
import { createAutopilotStore } from "./createAutopilotStore";

const target = {
	cwd: "/repo",
	prompt: "/helm",
	intervalMinutes: 30,
	node: "mac",
	scheduledHere: true,
};
let targets = [target];

vi.mock("../daemonLog", () => ({ daemonLog: () => {} }));
vi.mock("./listAutopilotTargets", () => ({
	listAutopilotTargets: () => targets,
}));
vi.mock("./readAutopilotTarget", () => ({
	readAutopilotTarget: (cwd: string) => targets.find((t) => t.cwd === cwd),
}));

describe("createAutopilotScheduler", () => {
	let dir: string;
	let path: string;
	let states: Record<string, AutopilotSessionState>;
	let launched: number;
	let links: Record<string, { launchedFrom?: string; itemId?: number }>;
	let runItems: AutopilotRunItem[];
	let stopped: string[];
	let itemStatus: Map<number, string>;
	let prompted: string[];
	let canPrompt: boolean;
	let stop: () => void = () => {};

	const deps = () => ({
		localNode: () => "mac",
		sessionState: (id: string) => states[id] ?? "ended",
		sessionLink: (id: string) => links[id],
		runItems: () => runItems,
		stopSession: (id: string) => stopped.push(id),
		itemSessions: (id: number) =>
			runItems.filter((run) => run.itemId === id).map((run) => run.sessionId),
		itemStatuses: async () => itemStatus,
		promptSession: (id: string) => {
			prompted.push(id);
			return canPrompt;
		},
		launch: () => {
			launched += 1;
			states[`s${launched}`] = "live";
			return `s${launched}`;
		},
	});
	const saved = (): AutopilotRecord => JSON.parse(readFileSync(path, "utf8"));
	const outcomes = () => saved()["/repo"].ticks.map((t) => t.outcome);
	const start = () => {
		const scheduler = createAutopilotScheduler(createAutopilotStore(path));
		stop = scheduler.start(deps());
		return scheduler;
	};

	beforeEach(() => {
		vi.useFakeTimers();
		dir = mkdtempSync(join(tmpdir(), "autopilot-"));
		path = join(dir, "autopilot.json");
		states = {};
		launched = 0;
		links = {};
		runItems = [];
		stopped = [];
		itemStatus = new Map();
		prompted = [];
		canPrompt = false;
		targets = [target];
	});

	afterEach(() => {
		stop();
		vi.useRealTimers();
		rmSync(dir, { recursive: true, force: true });
	});

	it("launches on start and again each interval, saving every tick", async () => {
		start();
		expect(outcomes()).toEqual(["launched"]);
		states.s1 = "ended";
		await vi.advanceTimersByTimeAsync(30 * 60_000);
		expect(outcomes()).toEqual(["launched", "finished", "launched"]);
		expect(saved()["/repo"].current?.sessionId).toBe("s2");
	});

	it("skips and records the tick while the previous run is live", async () => {
		start();
		await vi.advanceTimersByTimeAsync(30 * 60_000);
		expect(outcomes()).toEqual(["launched", "skipped"]);
		expect(saved()["/repo"].ticks[1].reason).toBe("s1 still live");
		expect(launched).toBe(1);
	});

	it("restores a live run after a restart without launching a second", () => {
		start();
		stop();
		const scheduler = start();
		expect(launched).toBe(1);
		expect(scheduler.status("/repo")?.running?.sessionId).toBe("s1");
	});

	it("does not schedule a repo whose autopilot.node is another node", async () => {
		targets = [{ ...target, node: "pc", scheduledHere: false }];
		const scheduler = start();
		await vi.advanceTimersByTimeAsync(60 * 60_000);
		expect(launched).toBe(0);
		expect(scheduler.runNow("/repo")).toEqual({
			ok: false,
			error: "autopilot for /repo runs on pc, not mac",
		});
		expect(scheduler.status("/repo")?.nextTickAt).toBeNull();
	});

	it("keeps paused state in the record and launches nothing while paused", async () => {
		const scheduler = start();
		states.s1 = "ended";
		scheduler.setPaused("/repo", true);
		await vi.advanceTimersByTimeAsync(60 * 60_000);
		expect(saved()["/repo"].paused).toBe(true);
		expect(launched).toBe(1);
		expect(scheduler.status("/repo")?.nextTickAt).toBeNull();
	});

	it("runs now unless a run is live", () => {
		const scheduler = start();
		expect(scheduler.runNow("/repo")).toEqual({
			ok: false,
			error: "run s1 is still live",
		});
		states.s1 = "errored";
		expect(scheduler.runNow("/repo")).toEqual({ ok: true });
		expect(saved()["/repo"].ticks.slice(1)).toMatchObject([
			{ outcome: "finished", reason: "session errored" },
			{ outcome: "launched", trigger: "manual", sessionId: "s2" },
		]);
	});

	it("fires at a follow-up requested by a backlog run the autopilot session started", async () => {
		const scheduler = start();
		links.b1 = { launchedFrom: "s1", itemId: 42 };
		expect(scheduler.followUp("b1", 10 * 60_000)).toMatchObject({
			ok: true,
			cwd: "/repo",
		});
		expect(scheduler.status("/repo")?.followUp).toMatchObject({
			sessionId: "b1",
			item: "a42",
		});
		expect(scheduler.status("/repo")?.nextTickAt).toBe(
			scheduler.status("/repo")?.followUp?.at,
		);
		states.s1 = "ended";
		await vi.advanceTimersByTimeAsync(10 * 60_000);
		expect(outcomes()).toEqual(["launched", "finished", "launched"]);
		expect(saved()["/repo"].followUp).toBeUndefined();
	});

	it("skips a follow-up tick while the run is still live", async () => {
		const scheduler = start();
		scheduler.followUp("s1", 5 * 60_000);
		await vi.advanceTimersByTimeAsync(5 * 60_000);
		expect(outcomes()).toEqual(["launched", "skipped"]);
		expect(saved()["/repo"].followUp).toBeUndefined();
	});

	it("refuses a follow-up from a session outside the autopilot run", () => {
		const scheduler = start();
		expect(scheduler.followUp("other", 60_000)).toEqual({
			ok: false,
			error: "session other is not an autopilot session or a run it started",
		});
	});

	it("records the items a run starts and keeps them after the run ends", async () => {
		const scheduler = start();
		runItems = [{ itemId: 7, sessionId: "b1", live: true }];
		expect(scheduler.status("/repo")?.items).toMatchObject([
			{ id: 7, sessionId: "b1" },
		]);
		states.s1 = "ended";
		runItems = [];
		await vi.advanceTimersByTimeAsync(30 * 60_000);
		expect(scheduler.status("/repo")?.items).toMatchObject([
			{ id: 7, sessionId: null },
		]);
	});

	it("stops an item's live run sessions", () => {
		const scheduler = start();
		runItems = [
			{ itemId: 7, sessionId: "b1", live: true },
			{ itemId: 8, sessionId: "b2", live: true },
		];
		expect(scheduler.stopItem("/repo", 7)).toEqual({ ok: true });
		expect(stopped).toEqual(["b1"]);
		expect(scheduler.stopItem("/repo", 9)).toEqual({
			ok: false,
			error: "no live run for item 9",
		});
	});

	it("stops the live run itself when no item is named", () => {
		const scheduler = start();
		expect(scheduler.stopItem("/repo")).toEqual({ ok: true });
		expect(stopped).toEqual(["s1"]);
		states.s1 = "ended";
		expect(scheduler.stopItem("/repo")).toEqual({
			ok: false,
			error: "no autopilot run is live",
		});
	});

	it("resumes a stalled item as an autopilot run, once no run is live", () => {
		const scheduler = start();
		expect(scheduler.resumeItem("/repo", 1867)).toEqual({
			ok: false,
			error: "run s1 is still live",
		});
		states.s1 = "ended";
		expect(scheduler.resumeItem("/repo", 1867)).toEqual({ ok: true });
		expect(saved()["/repo"].ticks.at(-1)).toMatchObject({
			outcome: "launched",
			trigger: "manual",
			sessionId: "s2",
		});
	});

	it("resumes an item a run left unfinished within a minute, then pauses if it stalls again", async () => {
		const scheduler = start();
		runItems = [{ itemId: 7, sessionId: "b1", live: true }];
		itemStatus = new Map([[7, "in-progress"]]);
		await vi.advanceTimersByTimeAsync(60_000);
		states.s1 = "ended";
		runItems = [];
		await vi.advanceTimersByTimeAsync(2 * 60_000);
		expect(launched).toBe(2);
		expect(saved()["/repo"].items?.[0].resumes).toBe(1);
		states.s2 = "ended";
		await vi.advanceTimersByTimeAsync(2 * 60_000);
		expect(launched).toBe(2);
		expect(scheduler.status("/repo")).toMatchObject({
			paused: true,
			pauseReason:
				"a7 is still not done, and nothing is running it, after autopilot already resumed it once",
		});
		scheduler.setPaused("/repo", false);
		expect(scheduler.status("/repo")?.pauseReason).toBeNull();
	});

	it("never resumes an item while a session still runs it, and trusts no status read before it ended", async () => {
		start();
		runItems = [{ itemId: 7, sessionId: "b1", live: true }];
		itemStatus = new Map([[7, "in-progress"]]);
		await vi.advanceTimersByTimeAsync(60_000);
		states.s1 = "ended";
		await vi.advanceTimersByTimeAsync(5 * 60_000);
		expect(launched).toBe(1);
		itemStatus = new Map([[7, "done"]]);
		runItems = [];
		await vi.advanceTimersByTimeAsync(5 * 60_000);
		expect(launched).toBe(1);
		expect(saved()["/repo"].paused).toBe(false);
	});

	it("prompts an idle run for its summary, holds it open, then records it", async () => {
		canPrompt = true;
		const scheduler = start();
		runItems = [{ itemId: 7, sessionId: "b1", live: true }];
		await vi.advanceTimersByTimeAsync(60_000);
		states.s1 = "ended";
		runItems = [];
		await vi.advanceTimersByTimeAsync(60_000);
		expect(prompted).toEqual(["s1"]);
		expect(scheduler.status("/repo")?.running?.sessionId).toBe("s1");
		const summary = {
			checked: "a1868 since deploy",
			decided: "no change, a1868 works",
			started: "none",
			next: "judge TUSK-1 after 18:17",
		};
		expect(scheduler.recordSummary("s1", summary)).toEqual({
			ok: true,
			cwd: "/repo",
		});
		await vi.advanceTimersByTimeAsync(60_000);
		expect(scheduler.status("/repo")?.runs[0]).toMatchObject({
			items: [7],
			summary,
		});
	});

	it("records a run without a summary once the grace after prompting passes", async () => {
		canPrompt = true;
		const scheduler = start();
		states.s1 = "ended";
		await vi.advanceTimersByTimeAsync(60_000);
		expect(prompted).toEqual(["s1"]);
		await vi.advanceTimersByTimeAsync(11 * 60_000);
		expect(scheduler.status("/repo")?.runs[0]).toMatchObject({
			outcome: "finished",
			sessionId: "s1",
		});
		expect(scheduler.status("/repo")?.runs[0].summary).toBeUndefined();
	});

	it("files a summary under the scheduled repo, not a stale record holding the same session id", async () => {
		writeFileSync(
			path,
			JSON.stringify({
				"/repo-2": {
					paused: false,
					ticks: [],
					current: { sessionId: "s1", startedAt: "2026-01-01T00:00:00Z" },
				},
			}),
		);
		const scheduler = start();
		const summary = { checked: "c", decided: "d", started: "none", next: "n" };
		expect(scheduler.recordSummary("s1", summary)).toEqual({
			ok: true,
			cwd: "/repo",
		});
		expect(saved()["/repo-2"].current).toBeUndefined();
	});
});
