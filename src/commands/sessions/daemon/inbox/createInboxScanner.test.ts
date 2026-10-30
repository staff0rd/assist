import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInboxScanner } from "./createInboxScanner";

const mockInterval = vi.fn();
const mockRunScan = vi.fn();
const mockLastScan = vi.fn();
const mockDaemonLog = vi.fn();

vi.mock("../../../inbox/readInboxIntervalMinutes", () => ({
	readInboxIntervalMinutes: () => mockInterval(),
}));
vi.mock("../../../inbox/runInboxScan", () => ({
	runInboxScan: () => mockRunScan(),
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
		mockRunScan.mockResolvedValue({ flagged: 0, added: 0 });
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
		let finish: (value: { flagged: number; added: number }) => void = () => {};
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

		finish({ flagged: 1, added: 1 });
		await vi.advanceTimersByTimeAsync(0);
		expect(scanner.status()).toEqual({
			scanning: false,
			intervalMinutes: null,
			lastError: null,
		});
		expect(onChange).toHaveBeenCalledTimes(2);
	});

	it("reports the last scan's failure", async () => {
		mockInterval.mockReturnValue(undefined);
		mockRunScan.mockRejectedValue(new Error("not logged in"));
		const scanner = createInboxScanner();
		stop = scanner.start(vi.fn());

		scanner.scanNow();
		await vi.advanceTimersByTimeAsync(0);
		expect(scanner.status().lastError).toBe("not logged in");
	});
});
