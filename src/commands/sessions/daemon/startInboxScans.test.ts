import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startInboxScans } from "./startInboxScans";

const mockInterval = vi.fn();
const mockRunScan = vi.fn();
const mockLastScan = vi.fn();
const mockDaemonLog = vi.fn();

vi.mock("../../inbox/readInboxIntervalMinutes", () => ({
	readInboxIntervalMinutes: () => mockInterval(),
}));
vi.mock("../../inbox/runInboxScan", () => ({
	runInboxScan: () => mockRunScan(),
}));
vi.mock("../../../shared/db/readInboxLastScan", () => ({
	readInboxLastScan: () => mockLastScan(),
}));
vi.mock("../../../shared/db/getDb", () => ({ getDb: async () => ({}) }));
vi.mock("./daemonLog", () => ({
	daemonLog: (line: string) => mockDaemonLog(line),
}));

describe("startInboxScans", () => {
	let stop: () => void = () => {};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.stubEnv("ASSIST_DATABASE_URL", "postgres://test");
	});

	afterEach(() => {
		stop();
		vi.useRealTimers();
		vi.unstubAllEnvs();
	});

	it("schedules nothing when the interval is unset", async () => {
		mockInterval.mockReturnValue(undefined);
		stop = startInboxScans(vi.fn());
		await vi.advanceTimersByTimeAsync(24 * 60 * 60_000);
		expect(mockRunScan).not.toHaveBeenCalled();
		expect(mockDaemonLog).toHaveBeenCalledWith(
			"inbox: scheduled scans off (inbox.intervalMinutes unset)",
		);
	});

	it("waits out the interval since the last scan, then scans on the interval", async () => {
		mockInterval.mockReturnValue(10);
		mockLastScan.mockResolvedValue(new Date(Date.now() - 4 * 60_000));
		mockRunScan.mockResolvedValue({ flagged: 2, added: 1 });
		const onAdded = vi.fn();
		stop = startInboxScans(onAdded);

		await vi.advanceTimersByTimeAsync(5 * 60_000);
		expect(mockRunScan).not.toHaveBeenCalled();
		await vi.advanceTimersByTimeAsync(60_000);
		expect(mockRunScan).toHaveBeenCalledTimes(1);
		expect(onAdded).toHaveBeenCalledTimes(1);
		expect(mockDaemonLog).toHaveBeenCalledWith(
			"inbox: scan flagged 2 message(s), 1 new",
		);

		await vi.advanceTimersByTimeAsync(10 * 60_000);
		expect(mockRunScan).toHaveBeenCalledTimes(2);
	});

	it("does not overlap a scan still running", async () => {
		mockInterval.mockReturnValue(1);
		mockLastScan.mockResolvedValue(undefined);
		let finish: (value: { flagged: number; added: number }) => void = () => {};
		mockRunScan.mockReturnValue(
			new Promise((resolve) => {
				finish = resolve;
			}),
		);
		stop = startInboxScans(vi.fn());

		await vi.advanceTimersByTimeAsync(10 * 60_000);
		expect(mockRunScan).toHaveBeenCalledTimes(1);
		finish({ flagged: 0, added: 0 });
		await vi.advanceTimersByTimeAsync(60_000);
		expect(mockRunScan).toHaveBeenCalledTimes(2);
	});
});
