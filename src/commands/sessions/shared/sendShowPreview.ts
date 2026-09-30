import { connectToDaemon } from "../daemon/connectToDaemon";
import { readSocketLines } from "../daemon/readSocketLines";

type ShowRequest = {
	sessionId: string;
	requestId: string;
	title: string;
	body: string;
};

type Reply = { type?: string; requestId?: string; message?: string };

export async function sendShowPreview(request: ShowRequest): Promise<void> {
	const socket = await connectToDaemon();
	await new Promise<void>((resolve, reject) => {
		const finish = (error?: Error) => {
			socket.destroy();
			if (error) reject(error);
			else resolve();
		};
		readSocketLines(socket, (line) => {
			const reply = parseReply(line);
			if (reply?.type === "error") finish(new Error(reply.message));
			if (reply?.requestId !== request.requestId) return;
			if (reply.type === "show-ack") finish();
			if (reply.type === "show-refused") finish(new Error(reply.message));
		});
		socket.on("error", (error) => finish(error));
		socket.on("close", () =>
			finish(new Error("daemon closed before acknowledging the show")),
		);
		socket.write(
			`${JSON.stringify({ type: "pr-preview", kind: "show", prNumber: null, ...request })}\n`,
		);
	});
}

function parseReply(line: string): Reply | null {
	try {
		return JSON.parse(line) as Reply;
	} catch {
		return null;
	}
}
