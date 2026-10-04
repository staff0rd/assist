import { createInterface } from "node:readline";
import { connectToDaemon } from "./connectToDaemon";

const QUERY_TIMEOUT_MS = 3_000;

export async function requestDaemonReply<T>(
	request: Record<string, unknown>,
	replyType: string,
): Promise<T | undefined> {
	let socket: Awaited<ReturnType<typeof connectToDaemon>>;
	try {
		socket = await connectToDaemon();
	} catch {
		return undefined;
	}
	return new Promise((resolve) => {
		const finish = (result: T | undefined) => {
			clearTimeout(timer);
			socket.destroy();
			resolve(result);
		};
		const timer = setTimeout(() => finish(undefined), QUERY_TIMEOUT_MS);
		const lines = createInterface({ input: socket });
		lines.on("error", () => {});
		lines.on("line", (line) => {
			try {
				const data = JSON.parse(line);
				if (data.type === replyType) finish(data as T);
			} catch {}
		});
		socket.on("error", () => finish(undefined));
		socket.write(`${JSON.stringify(request)}\n`);
	});
}
