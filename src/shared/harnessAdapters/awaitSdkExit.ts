import type { Socket } from "node:net";
import { createInterface } from "node:readline";
import { launcherEnv } from "./launcherEnv";

export type SdkLaunch = {
	prompt: string;
	cwd: string;
	conversationId?: string;
	resumeId?: string;
	model?: string;
};

type SdkExit = { type: string; exitCode?: number; error?: string };

export function awaitSdkExit(
	socket: Socket,
	launch: SdkLaunch & { sessionId: string },
	killed: () => boolean,
): Promise<number> {
	return new Promise((resolve, reject) => {
		let exit: SdkExit | undefined;
		const lines = createInterface({ input: socket });
		lines.on("error", () => {});
		lines.on("line", (line) => {
			try {
				const data = JSON.parse(line) as SdkExit;
				if (data.type !== "sdk-exit") return;
				exit = data;
				socket.end();
			} catch {}
		});
		socket.on("error", () => {});
		socket.on("close", () => {
			if (exit?.error) reject(new Error(exit.error));
			else resolve(killed() ? 0 : (exit?.exitCode ?? 1));
		});
		socket.write(
			`${JSON.stringify({ type: "sdk-launch", ...launch, env: launcherEnv() })}\n`,
		);
	});
}
