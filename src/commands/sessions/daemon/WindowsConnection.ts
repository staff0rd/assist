import type { Socket } from "node:net";
import { createInterface } from "node:readline";
import { buildHello } from "./buildHello";
import { daemonLog } from "./daemonLog";

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

	constructor(private readonly deps: ConnectionDeps) {}

	get connected(): boolean {
		return this.connection !== null;
	}

	ensure(): Promise<Socket> {
		if (this.connection) return this.connection;
		const connection = this.open();
		this.connection = connection;
		connection.catch(() => {
			if (this.connection === connection) this.connection = null;
		});
		return connection;
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
		const lines = createInterface({ input: socket });
		lines.on("error", () => {});
		lines.on("line", (line) => this.deps.onLine(line));
		socket.on("error", () => {});
		socket.on("close", () => {
			this.reset();
			this.deps.onClose();
		});
		this.write(buildHello());
		return socket;
	}

	private reset(): void {
		this.socket = null;
		this.connection = null;
	}
}
