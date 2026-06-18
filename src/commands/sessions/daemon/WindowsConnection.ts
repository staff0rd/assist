import type { Socket } from "node:net";
import { createInterface } from "node:readline";
import { buildHello } from "./buildHello";
import { daemonLog } from "./daemonLog";
import { LaunchCircuitBreaker } from "./LaunchCircuitBreaker";

type ConnectionDeps = {
	connect: () => Promise<Socket>;
	onLine: (line: string) => void;
	onClose: () => void;
};

// Owns the lazily-established TCP connection to the Windows daemon: one
// connection is shared across all WSL clients, reconnected on demand.
export class WindowsConnection {
	private connection: Promise<Socket> | null = null;
	private socket: Socket | null = null;
	// why: survives reset()/dispose() so a reconnect can't re-arm it into a loop; only a successful open clears it
	private readonly breaker = new LaunchCircuitBreaker();

	constructor(private readonly deps: ConnectionDeps) {}

	get connected(): boolean {
		return this.connection !== null;
	}

	ensure(): Promise<Socket> {
		if (this.connection) return this.connection;
		if (this.breaker.tripped())
			return Promise.reject(new Error(this.breaker.reason()));
		const connection = this.open();
		this.connection = connection;
		connection.then(
			() => this.breaker.clear(),
			() => this.onOpenFailure(connection),
		);
		return connection;
	}

	private onOpenFailure(connection: Promise<Socket>): void {
		if (this.connection === connection) this.connection = null;
		this.breaker.fail();
	}

	write(msg: object): void {
		this.socket?.write(`${JSON.stringify(msg)}\n`);
	}

	trySend(msg: object): boolean {
		if (!this.socket?.writable) return false;
		this.write(msg);
		return true;
	}

	dispose(): void {
		this.socket?.destroy();
		this.reset();
	}

	private async open(): Promise<Socket> {
		daemonLog("windows connection: opening (launch + tcp connect)");
		const socket = await this.deps.connect();
		daemonLog("windows connection: tcp connected, sending hello");
		this.socket = socket;
		this.wire(socket);
		this.write(buildHello());
		return socket;
	}

	private wire(socket: Socket): void {
		const lines = createInterface({ input: socket });
		lines.on("error", () => {});
		lines.on("line", (line) => this.deps.onLine(line));
		socket.on("error", () => {});
		socket.on("close", () => {
			this.reset();
			this.deps.onClose();
		});
	}

	private reset(): void {
		this.socket = null;
		this.connection = null;
	}
}
