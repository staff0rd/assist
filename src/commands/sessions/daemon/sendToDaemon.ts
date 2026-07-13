import { connectToDaemon } from "./connectToDaemon";

const WRITE_TIMEOUT_MS = 500;

export function sendToDaemon(message: Record<string, unknown>): Promise<void> {
	return new Promise((resolve, reject) => {
		connectToDaemon().then((socket) => {
			const timer = setTimeout(() => {
				socket.destroy();
				reject(new Error("timed out writing to daemon socket"));
			}, WRITE_TIMEOUT_MS);
			socket.on("error", (error) => {
				clearTimeout(timer);
				reject(error);
			});
			socket.write(`${JSON.stringify(message)}\n`, () => {
				clearTimeout(timer);
				socket.end();
				resolve();
			});
		}, reject);
	});
}
