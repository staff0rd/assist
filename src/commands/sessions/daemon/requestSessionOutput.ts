import { createInterface } from "node:readline";
import { connectToDaemon } from "./connectToDaemon";
import { readDaemonMessage } from "./readDaemonMessage";

const OUTPUT_TIMEOUT_MS = 5_000;

type OutputReply = { scrollback?: string; error?: string };

export type OutputTarget =
	| { sessionId: string }
	| { server: { origin: string; group: string } };

export async function requestSessionOutput(
	target: OutputTarget,
): Promise<string> {
	const socket = await connectToDaemon().catch(() => {
		throw new Error("No sessions daemon is running");
	});
	try {
		const lines = createInterface({ input: socket });
		lines.on("error", () => {});
		const reply = readDaemonMessage<OutputReply>(
			lines,
			OUTPUT_TIMEOUT_MS,
			{ error: "Timed out waiting for the sessions daemon" },
			(data) =>
				data.type === "session-output" ? (data as OutputReply) : undefined,
		);
		socket.write(`${JSON.stringify({ type: "output", ...target })}\n`);
		const { scrollback, error } = await reply;
		if (scrollback === undefined) throw new Error(error);
		return scrollback;
	} finally {
		socket.destroy();
	}
}
