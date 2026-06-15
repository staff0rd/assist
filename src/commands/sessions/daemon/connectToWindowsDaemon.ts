import * as net from "node:net";
import { windowsDaemonHost, windowsDaemonPort } from "./windowsDaemonPort";

export function connectToWindowsDaemon(): Promise<net.Socket> {
	return new Promise((resolve, reject) => {
		const socket = net.connect(windowsDaemonPort(), windowsDaemonHost());
		socket.once("connect", () => resolve(socket));
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
