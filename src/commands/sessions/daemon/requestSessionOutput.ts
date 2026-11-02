import { createInterface } from "node:readline";
import { connectToDaemon } from "./connectToDaemon";
import { readDaemonMessage } from "./readDaemonMessage";

const OUTPUT_TIMEOUT_MS = 5_000;

type OutputReply = {
	sessionId?: string;
	scrollback?: string;
	exited?: "done" | "error";
	error?: string;
};

export type OutputTarget =
	| { sessionId: string }
	| { server: { origin: string; group: string } };

type SessionOutput = {
	sessionId?: string;
	scrollback: string;
	exited?: "done" | "error";
};

export async function requestSessionOutput(
	target: OutputTarget,
): Promise<SessionOutput> {
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
		const { sessionId, scrollback, exited, error } = await reply;
		if (scrollback === undefined) throw new Error(error);
		return { sessionId, scrollback, exited };
	} finally {
		socket.destroy();
	}
}
