import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ownsPidFile, startPidFileWatchdog } from "./startPidFileWatchdog";

vi.mock("node:fs", () => ({ readFileSync: vi.fn() }));

const readMock = readFileSync as unknown as ReturnType<typeof vi.fn>;

describe("pidFileWatchdog", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it("does not fire while this process owns the pid file", () => {
		readMock.mockReturnValue(`${process.pid}\n`);
		const onLost = vi.fn();

		startPidFileWatchdog(onLost, 1_000);
		vi.advanceTimersByTime(5_000);

		expect(onLost).not.toHaveBeenCalled();
	});

	it("fires when another process overwrites the pid file", () => {
		readMock.mockReturnValue(String(process.pid));
		const onLost = vi.fn();

		startPidFileWatchdog(onLost, 1_000);
		vi.advanceTimersByTime(1_000);
		expect(onLost).not.toHaveBeenCalled();

		readMock.mockReturnValue("999999");
		vi.advanceTimersByTime(1_000);
		expect(onLost).toHaveBeenCalledTimes(1);
	});

	it("treats a missing pid file as lost ownership", () => {
		readMock.mockImplementation(() => {
			throw new Error("ENOENT");
		});

		expect(ownsPidFile()).toBe(false);
	});
});
