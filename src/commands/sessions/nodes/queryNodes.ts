import { createInterface } from "node:readline";
import { connectToDaemon } from "../daemon/connectToDaemon";
import type { NodesMessage } from "../daemon/links/LinkStatus";

const QUERY_TIMEOUT_MS = 3_000;

export async function queryNodes(): Promise<NodesMessage | undefined> {
	let socket: Awaited<ReturnType<typeof connectToDaemon>>;
	try {
		socket = await connectToDaemon();
	} catch {
		return undefined;
	}
	return new Promise((resolve) => {
		const finish = (result: NodesMessage | undefined) => {
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
				if (data.type === "nodes") finish(data as NodesMessage);
			} catch {}
		});
		socket.on("error", () => finish(undefined));
		socket.write(`${JSON.stringify({ type: "nodes" })}\n`);
	});
}
