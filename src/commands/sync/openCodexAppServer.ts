import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { harnesses } from "../../shared/harnesses";
import {
	type CodexAppServer,
	createCodexRpcClient,
} from "./createCodexRpcClient";
import { type PendingCodexCall, routeCodexRpcLine } from "./routeCodexRpcLine";
import { watchCodexAppServer } from "./watchCodexAppServer";

const TIMEOUT_MS = 20_000;

export async function openCodexAppServer(
	homeDir: string,
): Promise<CodexAppServer> {
	const child = spawn(harnesses.codex.command, ["app-server"], {
		env: { ...process.env, CODEX_HOME: homeDir },
		stdio: ["pipe", "pipe", "pipe"],
	});
	const pending = new Map<number, PendingCodexCall>();
	const failAll = (error: Error) => {
		for (const entry of pending.values()) entry.reject(error);
		pending.clear();
	};
	watchCodexAppServer(child, failAll);
	createInterface({ input: child.stdout }).on("line", (line) =>
		routeCodexRpcLine(line, pending),
	);

	const timer = setTimeout(
		() => failAll(new Error("codex app-server did not respond in time")),
		TIMEOUT_MS,
	);
	const server = createCodexRpcClient(child, pending, timer);
	try {
		await server.call("initialize", {
			clientInfo: { name: "assist", version: "0" },
		});
	} catch (error) {
		server.close();
		throw error;
	}
	child.stdin.write(`${JSON.stringify({ method: "initialized" })}\n`);
	return server;
}
