import { connectToDaemon } from "./connectToDaemon";

// why: every fire-and-forget client message shares the same bounded-write dance —
// connect, guard with a short destroy timeout, swallow socket errors, then end
// once the line is flushed. Callers wrap this in try/catch to stay best-effort.
export async function sendToDaemon(
	message: Record<string, unknown>,
): Promise<void> {
	const socket = await connectToDaemon();
	const timer = setTimeout(() => socket.destroy(), 500);
	socket.on("error", () => {});
	socket.write(`${JSON.stringify(message)}\n`, () => {
		clearTimeout(timer);
		socket.end();
	});
}
