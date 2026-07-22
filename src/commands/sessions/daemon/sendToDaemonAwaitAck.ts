import { connectToDaemon } from "./connectToDaemon";
import { readSocketLines } from "./readSocketLines";

const ACK_TIMEOUT_MS = 1_000;

export function sendToDaemonAwaitAck(
	message: Record<string, unknown>,
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
				ACK_TIMEOUT_MS,
			);
			readSocketLines(socket, (line) => {
				if (isAck(line)) finish();
			});
			socket.on("error", (error) => finish(error));
			socket.on("close", () =>
				finish(new Error("daemon closed before acknowledging")),
			);
			socket.write(`${JSON.stringify(message)}\n`);
		}, reject);
	});
}

function isAck(line: string): boolean {
	try {
		return (JSON.parse(line) as { type?: string }).type === "ack";
	} catch {
		return false;
	}
}
