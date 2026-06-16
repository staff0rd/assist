import type { Socket } from "node:net";
import { connectToWindowsDaemon } from "./connectToWindowsDaemon";
import { ensureWindowsDaemonRunning } from "./ensureWindowsDaemonRunning";

export async function defaultConnect(): Promise<Socket> {
	await ensureWindowsDaemonRunning();
	return connectToWindowsDaemon();
}
