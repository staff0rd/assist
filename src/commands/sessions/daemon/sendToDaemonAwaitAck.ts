import { connectToDaemon } from "./connectToDaemon";
import { readSocketLines } from "./readSocketLines";

const DEFAULT_ACK_TIMEOUT_MS = 1_000;

type Ack = { type?: string; error?: string };

export function sendToDaemonAwaitAck(
	message: Record<string, unknown>,
	timeoutMs = DEFAULT_ACK_TIMEOUT_MS,
): Promise<void> {
	return new Promise((resolve, reject) => {
		connectToDaemon().then((socket) => {
			let settled = false;
			const finish = (error?: Error) => {
				if (settled) return;
				settled = true;
				clearTimeout(timer);
				socket.destroy();
				if (error) reject(error);
				else resolve();
			};
			const timer = setTimeout(
				() => finish(new Error("timed out awaiting daemon ack")),
				timeoutMs,
			);
			readSocketLines(socket, (line) => {
				const ack = parseAck(line);
				if (ack) finish(ack.error ? new Error(ack.error) : undefined);
			});
			socket.on("error", (error) => finish(error));
			socket.on("close", () =>
				finish(new Error("daemon closed before acknowledging")),
			);
			socket.write(`${JSON.stringify(message)}\n`);
		}, reject);
	});
}

function parseAck(line: string): Ack | undefined {
	try {
		const parsed = JSON.parse(line) as Ack;
		return parsed.type === "ack" ? parsed : undefined;
	} catch {
		return undefined;
	}
}
