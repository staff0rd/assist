import type { Socket } from "node:net";
import { connectToDaemon } from "../../commands/sessions/daemon/connectToDaemon";
import type { SpawnResult } from "../spawnInherit";
import { awaitSdkExit, type SdkLaunch } from "./awaitSdkExit";

export function launchSdkViaDaemon(launch: SdkLaunch): SpawnResult {
	let socket: Socket | undefined;
	let killed = false;
	const child = {
		kill: () => {
			killed = true;
			socket?.destroy();
			return true;
		},
	};
	const run = async () => {
		const sessionId = process.env.ASSIST_SESSION_ID;
		if (process.env.ASSIST_SDK_SESSION !== "1" || !sessionId)
			throw new Error(
				"Claude (SDK) runs workflows only in sessions the assist daemon starts; launch it from the web UI, or pick Claude to run it in this terminal",
			);
		socket = await connectToDaemon();
		if (killed) {
			socket.destroy();
			return 0;
		}
		return awaitSdkExit(socket, { ...launch, sessionId }, () => killed);
	};
	return { child, done: run() };
}
