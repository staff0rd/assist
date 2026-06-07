import * as net from "node:net";
import { daemonPaths } from "./daemonPaths";

export function connectToDaemon(): Promise<net.Socket> {
	return new Promise((resolve, reject) => {
		const socket = net.connect(daemonPaths.socket);
		socket.once("connect", () => resolve(socket));
		socket.once("error", reject);
	});
}

export async function isDaemonRunning(): Promise<boolean> {
	try {
		(await connectToDaemon()).destroy();
		return true;
	} catch {
		return false;
	}
}
