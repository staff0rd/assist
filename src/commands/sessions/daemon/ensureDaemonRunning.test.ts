import { spawn } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isDaemonRunning } from "./connectToDaemon";
import { ensureDaemonRunning } from "./ensureDaemonRunning";

vi.mock("node:child_process", () => ({ spawn: vi.fn() }));
vi.mock("node:fs", () => ({ mkdirSync: vi.fn(), openSync: vi.fn(() => 3) }));
vi.mock("./connectToDaemon", () => ({ isDaemonRunning: vi.fn() }));

const isRunningMock = isDaemonRunning as unknown as ReturnType<typeof vi.fn>;
const spawnMock = spawn as unknown as ReturnType<typeof vi.fn>;

describe("ensureDaemonRunning", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		spawnMock.mockReturnValue({ unref: vi.fn() });
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

		const promise = ensureDaemonRunning();
		await vi.advanceTimersByTimeAsync(1_000);
		await promise;

		expect(spawnMock).toHaveBeenCalledWith(
			process.execPath,
			[process.argv[1], "daemon", "run"],
			expect.objectContaining({ detached: true }),
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
});
