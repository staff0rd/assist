import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { InboxScanUsage } from "../../../inbox/InboxScanEvent";
import { createInboxScanner } from "./createInboxScanner";

const mockInterval = vi.fn();
const mockRunScan = vi.fn();
const mockLastScan = vi.fn();
const mockDaemonLog = vi.fn();
const usage: InboxScanUsage = {
	input: 1,
	output: 2,
	cacheRead: 3,
	cacheWrite: 4,
	costUsd: 0.19,
	durationMs: 44000,
};
type ScanReply = { flagged: number; added: number; usage: typeof usage };

vi.mock("../../../inbox/readInboxIntervalMinutes", () => ({
	readInboxIntervalMinutes: () => mockInterval(),
}));
const mockReadLastRun = vi.fn();
const mockWriteLastRun = vi.fn();

vi.mock("../../../inbox/runInboxScan", () => ({
	runInboxScan: (_orm: unknown, options: unknown) => mockRunScan(options),
}));
vi.mock("../../../../shared/db/readInboxLastRun", () => ({
	readInboxLastRun: () => mockReadLastRun(),
}));
vi.mock("../../../../shared/db/writeInboxLastRun", () => ({
	writeInboxLastRun: (_orm: unknown, run: unknown) => mockWriteLastRun(run),
}));
vi.mock("../../../../shared/db/readInboxLastScan", () => ({
	readInboxLastScan: () => mockLastScan(),
}));
vi.mock("../../../../shared/db/getDb", () => ({ getDb: async () => ({}) }));
vi.mock("../daemonLog", () => ({
	daemonLog: (line: string) => mockDaemonLog(line),
}));

describe("createInboxScanner", () => {
	let stop: () => void = () => {};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.stubEnv("ASSIST_DATABASE_URL", "postgres://test");
		mockRunScan.mockResolvedValue({ flagged: 0, added: 0, usage });
		mockReadLastRun.mockResolvedValue(undefined);
		mockWriteLastRun.mockResolvedValue(undefined);
	});

	afterEach(() => {
		stop();
		vi.useRealTimers();
		vi.unstubAllEnvs();
	});

	it("schedules nothing while the interval is unset", async () => {
		mockInterval.mockReturnValue(undefined);
		stop = createInboxScanner().start(vi.fn());
		await vi.advanceTimersByTimeAsync(24 * 60 * 60_000);
		expect(mockRunScan).not.toHaveBeenCalled();
		expect(mockDaemonLog).toHaveBeenCalledWith(
			"inbox: scheduled scans off (inbox.intervalMinutes unset)",
		);
	});

	it("picks up an interval set while running, without a restart", async () => {
		mockInterval.mockReturnValue(undefined);
		mockLastScan.mockResolvedValue(undefined);
		stop = createInboxScanner().start(vi.fn());
		await vi.advanceTimersByTimeAsync(5 * 60_000);
		expect(mockRunScan).not.toHaveBeenCalled();

		mockInterval.mockReturnValue(30);
		await vi.advanceTimersByTimeAsync(60_000);
		expect(mockRunScan).toHaveBeenCalledTimes(1);
		expect(mockDaemonLog).toHaveBeenCalledWith(
			"inbox: scheduled scans every 30 minute(s)",
		);
	});

	it("scans once the interval since the last scan has passed", async () => {
		mockInterval.mockReturnValue(10);
		mockLastScan.mockResolvedValue(new Date(Date.now() - 4 * 60_000));
		stop = createInboxScanner().start(vi.fn());

		await vi.advanceTimersByTimeAsync(5 * 60_000);
		expect(mockRunScan).not.toHaveBeenCalled();
		await vi.advanceTimersByTimeAsync(60_000);
		expect(mockRunScan).toHaveBeenCalledTimes(1);
	});

	it("scans on request, notifies at start and end, and refuses to overlap", async () => {
		mockInterval.mockReturnValue(undefined);
		let finish: (value: ScanReply) => void = () => {};
		mockRunScan.mockReturnValue(
			new Promise((resolve) => {
				finish = resolve;
			}),
		);
		const onChange = vi.fn();
		const scanner = createInboxScanner();
		stop = scanner.start(onChange);

		expect(scanner.scanNow()).toBe(true);
		await vi.advanceTimersByTimeAsync(0);
		expect(scanner.status().scanning).toBe(true);
		expect(scanner.scanNow()).toBe(false);

		finish({ flagged: 1, added: 1, usage });
		await vi.advanceTimersByTimeAsync(0);
		expect(scanner.status()).toMatchObject({
			scanning: false,
			intervalMinutes: null,
			lastError: null,
			run: { status: "finished" },
		});
		expect(onChange.mock.calls).toEqual([["inbox"], ["inbox"]]);
	});

	it("streams events, throttles activity notifications and persists the run", async () => {
		mockInterval.mockReturnValue(undefined);
		let finish: (value: ScanReply) => void = () => {};
		let onEvent: (event: unknown) => void = () => {};
		let onUsage: (value: typeof usage) => void = () => {};
		mockRunScan.mockImplementation(
			(options: { onEvent: typeof onEvent; onUsage: typeof onUsage }) => {
				onEvent = options.onEvent;
				onUsage = options.onUsage;
				return new Promise((resolve) => {
					finish = resolve;
				});
			},
		);
		const onChange = vi.fn();
		const scanner = createInboxScanner();
		stop = scanner.start(onChange);
		scanner.scanNow();
		await vi.advanceTimersByTimeAsync(0);

		const event = {
			at: "t",
			kind: "tool",
			label: "Gmail search_threads",
			detail: "q",
		};
		onEvent(event);
		onEvent(event);
		onUsage({ ...usage, costUsd: null });
		expect(scanner.status().run?.events).toHaveLength(2);
		expect(scanner.status().run?.usage?.costUsd).toBeNull();
		await vi.advanceTimersByTimeAsync(1000);
		expect(onChange.mock.calls).toEqual([["inbox"], ["inbox-activity"]]);

		onUsage(usage);
		finish({ flagged: 3, added: 1, usage });
		await vi.advanceTimersByTimeAsync(0);
		const run = scanner.status().run;
		expect(run?.status).toBe("finished");
		expect(run?.usage).toEqual(usage);
		expect(run?.events.at(-1)).toMatchObject({
			kind: "result",
			detail: "Flagged 3 message(s), 1 new",
		});
		expect(mockWriteLastRun).toHaveBeenCalledWith(run);
	});

	it("restores the last run saved before a restart", async () => {
		mockInterval.mockReturnValue(undefined);
		const saved = {
			status: "failed",
			startedAt: "a",
			finishedAt: "b",
			events: [],
		};
		mockReadLastRun.mockResolvedValue(saved);
		const scanner = createInboxScanner();
		stop = scanner.start(vi.fn());
		await vi.advanceTimersByTimeAsync(0);
		expect(scanner.status().run).toEqual(saved);
	});

	it("reports the last scan's failure", async () => {
		mockInterval.mockReturnValue(undefined);
		mockRunScan.mockRejectedValue(new Error("not logged in"));
		const scanner = createInboxScanner();
		stop = scanner.start(vi.fn());

		scanner.scanNow();
		await vi.advanceTimersByTimeAsync(0);
		expect(scanner.status().lastError).toBe("not logged in");
		expect(scanner.status().run).toMatchObject({ status: "failed" });
		expect(scanner.status().run?.events.at(-1)).toMatchObject({
			kind: "error",
			detail: "not logged in",
		});
	});
});
