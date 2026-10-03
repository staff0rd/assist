import { spawn } from "node:child_process";
import { openSync, type Stats, statSync, unlinkSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../../test/mocks/childProcessMock";
import type * as fsMockModule from "../../../test/mocks/fsMock";
import { isDaemonRunning } from "./connectToDaemon";
import { ensureDaemonRunning } from "./ensureDaemonRunning";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);
vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../../test/mocks/fsMock")
	).fsMock(),
);
vi.mock("./connectToDaemon", () => ({ isDaemonRunning: vi.fn() }));

const isRunningMock = isDaemonRunning as unknown as ReturnType<typeof vi.fn>;
const spawnMock = vi.mocked(spawn);
const openSyncMock = vi.mocked(openSync);
const statSyncMock = vi.mocked(statSync);
const unlinkSyncMock = vi.mocked(unlinkSync);

function eexist(): Error {
	return Object.assign(new Error("EEXIST"), { code: "EEXIST" });
}

describe("ensureDaemonRunning", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		spawnMock.mockReturnValue({ unref: vi.fn() } as never);
		openSyncMock.mockReturnValue(3);
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it("does not spawn when the daemon is already running", async () => {
		isRunningMock.mockResolvedValue(true);

		await ensureDaemonRunning();

		expect(spawnMock).not.toHaveBeenCalled();
	});

	it("spawns the daemon detached and waits until it accepts connections", async () => {
		isRunningMock
			.mockResolvedValueOnce(false)
			.mockResolvedValueOnce(false)
			.mockResolvedValue(true);

		const promise = ensureDaemonRunning("test spawn");
		await vi.advanceTimersByTimeAsync(1_000);
		await promise;

		expect(spawnMock).toHaveBeenCalledWith(
			process.execPath,
			[process.argv[1], "daemon", "run"],
			expect.objectContaining({
				detached: true,
				env: expect.objectContaining({
					ASSIST_DAEMON_SPAWN_REASON: "test spawn",
				}),
			}),
		);
	});

	it("rejects when the daemon never comes up", async () => {
		isRunningMock.mockResolvedValue(false);

		const promise = ensureDaemonRunning();
		const assertion = expect(promise).rejects.toThrow(
			"Sessions daemon did not start",
		);
		await vi.advanceTimersByTimeAsync(11_000);
		await assertion;
	});

	it("spawns at most one daemon when calls race", async () => {
		isRunningMock
			.mockResolvedValueOnce(false)
			.mockResolvedValueOnce(false)
			.mockResolvedValue(true);
		let lockHeld = false;
		openSyncMock.mockImplementation((_path, flags) => {
			if (flags !== "wx") return 3;
			if (lockHeld) throw eexist();
			lockHeld = true;
			return 4;
		});
		unlinkSyncMock.mockImplementation(() => {
			lockHeld = false;
		});
		statSyncMock.mockReturnValue({ mtimeMs: Date.now() } as Stats);

		const first = ensureDaemonRunning();
		const second = ensureDaemonRunning();
		await vi.advanceTimersByTimeAsync(1_000);
		await Promise.all([first, second]);

		expect(spawnMock).toHaveBeenCalledTimes(1);
	});

	it("does not spawn while another process holds a fresh lock", async () => {
		isRunningMock.mockResolvedValueOnce(false).mockResolvedValue(true);
		openSyncMock.mockImplementation((_path, flags) => {
			if (flags === "wx") throw eexist();
			return 3;
		});
		statSyncMock.mockReturnValue({ mtimeMs: Date.now() } as Stats);

		const promise = ensureDaemonRunning();
		await vi.advanceTimersByTimeAsync(1_000);
		await promise;

		expect(spawnMock).not.toHaveBeenCalled();
		expect(unlinkSyncMock).not.toHaveBeenCalled();
	});

	it("steals a stale lock left by a crashed spawner", async () => {
		isRunningMock.mockResolvedValueOnce(false).mockResolvedValue(true);
		let attempts = 0;
		openSyncMock.mockImplementation((_path, flags) => {
			if (flags !== "wx") return 3;
			attempts++;
			if (attempts === 1) throw eexist();
			return 4;
		});
		statSyncMock.mockReturnValue({ mtimeMs: Date.now() - 60_000 } as Stats);

		const promise = ensureDaemonRunning();
		await vi.advanceTimersByTimeAsync(1_000);
		await promise;

		expect(unlinkSyncMock).toHaveBeenCalled();
		expect(spawnMock).toHaveBeenCalledTimes(1);
	});
});
