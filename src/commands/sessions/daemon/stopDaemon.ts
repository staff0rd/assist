import type * as net from "node:net";
import { connectToDaemon } from "./connectToDaemon";

const STOP_TIMEOUT_MS = 5_000;

export async function stopDaemon(): Promise<void> {
	let socket: net.Socket;
	try {
		socket = await connectToDaemon();
	} catch {
		console.log("Sessions daemon is not running");
		return;
	}

	socket.write(`${JSON.stringify({ type: "shutdown" })}\n`);
	if (await closedBeforeTimeout(socket)) {
		console.log("Sessions daemon stopped");
	} else {
		console.error(
			`Sessions daemon did not stop within ${STOP_TIMEOUT_MS / 1000}s`,
		);
		process.exitCode = 1;
	}
}

// The daemon exiting closes the connection — that close is the stop ack
function closedBeforeTimeout(socket: net.Socket): Promise<boolean> {
	return new Promise((resolve) => {
		const timer = setTimeout(() => {
			socket.destroy();
			resolve(false);
		}, STOP_TIMEOUT_MS);
		// A paused socket never reads the daemon's FIN, so 'close' would not fire
		socket.resume();
		socket.on("error", () => {});
		socket.once("close", () => {
			clearTimeout(timer);
			resolve(true);
		});
	});
}
