import { EventEmitter } from "node:events";
import { unlinkSync } from "node:fs";
import * as net from "node:net";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isDaemonRunning } from "./connectToDaemon";
import { onListening } from "./onListening";
import type { SessionManager } from "./SessionManager";
import { startDaemonServer } from "./startDaemonServer";

vi.mock("node:fs", () => ({ unlinkSync: vi.fn() }));
vi.mock("node:net", () => ({ createServer: vi.fn() }));
vi.mock("./connectToDaemon", () => ({ isDaemonRunning: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./onListening", () => ({ onListening: vi.fn() }));

const createServerMock = net.createServer as unknown as ReturnType<
	typeof vi.fn
>;
const isRunningMock = isDaemonRunning as unknown as ReturnType<typeof vi.fn>;
const onListeningMock = onListening as unknown as ReturnType<typeof vi.fn>;

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

		startDaemonServer(manager, checkAutoExit);
		await flush();

		expect(onListeningMock).toHaveBeenCalledTimes(1);
	});

	it("restores sessions once when recovering from a stale socket", async () => {
		const server = new FakeServer(["error", "listening"]);
		createServerMock.mockReturnValue(server);

		startDaemonServer(manager, checkAutoExit);
		await flush();

		expect(unlinkSync).toHaveBeenCalled();
		expect(server.listenCalls).toBe(2);
		expect(onListeningMock).toHaveBeenCalledTimes(1);
	});
});
