import * as net from "node:net";
import { windowsDaemonHost, windowsDaemonPort } from "./windowsDaemonPort";

const CONNECT_TIMEOUT_MS = 2_000;
const KEEPALIVE_PROBE_MS = 10_000;

export function connectToWindowsDaemon(): Promise<net.Socket> {
	return new Promise((resolve, reject) => {
		const socket = net.connect(windowsDaemonPort(), windowsDaemonHost());
		socket.setTimeout(CONNECT_TIMEOUT_MS);
		socket.once("timeout", () => {
			socket.destroy();
			reject(new Error("windows daemon connect timed out"));
		});
		socket.once("connect", () => {
			socket.setTimeout(0);
			socket.setKeepAlive(true, KEEPALIVE_PROBE_MS);
			resolve(socket);
		});
		socket.once("error", reject);
	});
}

export async function isWindowsDaemonRunning(): Promise<boolean> {
	try {
		(await connectToWindowsDaemon()).destroy();
		return true;
	} catch {
		return false;
	}
}
