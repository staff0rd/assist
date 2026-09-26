import { EventEmitter } from "node:events";
import { unlinkSync } from "node:fs";
import * as net from "node:net";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isDaemonRunning } from "./connectToDaemon";
import { daemonLog } from "./daemonLog";
import { exitAfterFlush } from "./exitAfterFlush";
import { onListening } from "./onListening";
import { isPidAlive, readDaemonPidFile } from "./readDaemonPidFile";
import type { SessionManager } from "./SessionManager";
import { startDaemonServer } from "./startDaemonServer";

vi.mock("node:fs", () => ({ unlinkSync: vi.fn() }));
vi.mock("node:net", () => ({ createServer: vi.fn() }));
vi.mock("./connectToDaemon", () => ({ isDaemonRunning: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./exitAfterFlush", () => ({ exitAfterFlush: vi.fn() }));
vi.mock("./onListening", () => ({ onListening: vi.fn() }));
vi.mock("./readDaemonPidFile", () => ({
	isPidAlive: vi.fn(),
	readDaemonPidFile: vi.fn(),
}));

const createServerMock = net.createServer as unknown as ReturnType<
	typeof vi.fn
>;
const isRunningMock = isDaemonRunning as unknown as ReturnType<typeof vi.fn>;
const onListeningMock = onListening as unknown as ReturnType<typeof vi.fn>;
const exitAfterFlushMock = exitAfterFlush as unknown as ReturnType<
	typeof vi.fn
>;
const logMock = daemonLog as unknown as ReturnType<typeof vi.fn>;
const readPidMock = readDaemonPidFile as unknown as ReturnType<typeof vi.fn>;
const isPidAliveMock = isPidAlive as unknown as ReturnType<typeof vi.fn>;

function loggedLines(): string[] {
	return logMock.mock.calls.map((call) => String(call[0]));
}

function asPlatform(platform: NodeJS.Platform): void {
	Object.defineProperty(process, "platform", {
		value: platform,
		configurable: true,
	});
}

function eaddrinuse(): NodeJS.ErrnoException {
	return Object.assign(new Error("EADDRINUSE"), { code: "EADDRINUSE" });
}

class FakeServer extends EventEmitter {
	listenCalls = 0;
	private readonly outcomes: ("error" | "listening")[];
	constructor(outcomes: ("error" | "listening")[]) {
		super();
		this.outcomes = outcomes;
	}
	listen(_path: string, onListeningEvent?: () => void): this {
		if (onListeningEvent) this.once("listening", onListeningEvent);
		const outcome = this.outcomes[this.listenCalls++];
		queueMicrotask(() => {
			if (outcome === "error") this.emit("error", eaddrinuse());
			else this.emit("listening");
		});
		return this;
	}
}

const manager = {} as SessionManager;
const checkAutoExit = vi.fn();

async function flush(): Promise<void> {
	for (let i = 0; i < 10; i++) await Promise.resolve();
}

describe("startDaemonServer", () => {
	beforeEach(() => {
		isRunningMock.mockResolvedValue(false);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("restores sessions once on the normal startup path", async () => {
		createServerMock.mockReturnValue(new FakeServer(["listening"]));

		await startDaemonServer(manager, checkAutoExit);
		await flush();

		expect(onListeningMock).toHaveBeenCalledTimes(1);
	});

	it("restores sessions once when recovering from a stale socket", async () => {
		const server = new FakeServer(["error", "listening"]);
		createServerMock.mockReturnValue(server);

		await startDaemonServer(manager, checkAutoExit);
		await flush();

		expect(unlinkSync).toHaveBeenCalled();
		expect(server.listenCalls).toBe(2);
		expect(onListeningMock).toHaveBeenCalledTimes(1);
	});

	describe("on the windows host", () => {
		const realPlatform = process.platform;

		afterEach(() => {
			asPlatform(realPlatform);
		});

		it("binds the pipe", async () => {
			asPlatform("win32");
			createServerMock.mockReturnValue(new FakeServer(["listening"]));

			await startDaemonServer(manager, checkAutoExit);
			await flush();

			expect(onListeningMock).toHaveBeenCalledTimes(1);
		});

		it("names the wedged holder instead of retrying a held pipe", async () => {
			asPlatform("win32");
			readPidMock.mockReturnValue(192936);
			isPidAliveMock.mockReturnValue(true);
			const server = new FakeServer(["error", "listening"]);
			createServerMock.mockReturnValue(server);

			await startDaemonServer(manager, checkAutoExit);
			await flush();

			expect(server.listenCalls).toBe(1);
			expect(unlinkSync).not.toHaveBeenCalled();
			expect(exitAfterFlushMock).toHaveBeenCalledWith(1);
			expect(onListeningMock).not.toHaveBeenCalled();
			expect(loggedLines()).toContainEqual(
				expect.stringContaining("kill PID 192936"),
			);
			expect(loggedLines()).not.toContainEqual(
				expect.stringContaining("removing stale socket"),
			);
		});

		it("reports an unidentifiable holder when daemon.pid is gone", async () => {
			asPlatform("win32");
			readPidMock.mockReturnValue(undefined);
			createServerMock.mockReturnValue(new FakeServer(["error", "listening"]));

			await startDaemonServer(manager, checkAutoExit);
			await flush();

			expect(exitAfterFlushMock).toHaveBeenCalledWith(1);
			expect(loggedLines()).toContainEqual(
				expect.stringContaining("could not be identified"),
			);
		});
	});
});
