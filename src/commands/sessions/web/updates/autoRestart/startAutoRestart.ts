import { getInstallDir } from "../../../../../shared/getInstallDir";
import { requestDaemonReply } from "../../../daemon/requestDaemonReply";
import { performRestart } from "../../restartWeb";
import { autoRestartEnabled } from "../autoRestartEnabled";
import { readRestartState } from "../readRestartState";
import type { LiveSession } from "./autoRestartBlocker";
import { autoRestartAttempts } from "./autoRestartAttempts";
import {
	type AutoRestartSnapshot,
	createAutoRestartCheck,
} from "./createAutoRestartCheck";
import { logViaDaemon } from "./logViaDaemon";

const CHECK_INTERVAL_MS = 20_000;

async function snapshot(installDir: string): Promise<AutoRestartSnapshot> {
	const [state, greeting] = await Promise.all([
		readRestartState(installDir),
		requestDaemonReply<{ sessions?: LiveSession[] }>(
			{ type: "ping" },
			"sessions",
		),
	]);
	return {
		built: state.built,
		buildPending: state.buildPending,
		restart: state.restart,
		loop: greeting ? state.reply?.loop : undefined,
		sessions: greeting?.sessions ?? [],
	};
}

export function startAutoRestart(port: number): void {
	const installDir = getInstallDir();
	const tick = createAutoRestartCheck({
		enabled: () => autoRestartEnabled(installDir),
		snapshot: () => snapshot(installDir),
		attempted: autoRestartAttempts(port),
		restart: (target) => performRestart(target),
		log: (message) => void logViaDaemon(message),
	});
	let running = false;
	setInterval(() => {
		if (running) return;
		running = true;
		tick()
			.catch((error) =>
				console.log(
					`auto-restart: check failed: ${error instanceof Error ? error.message : String(error)}`,
				),
			)
			.finally(() => {
				running = false;
			});
	}, CHECK_INTERVAL_MS).unref();
}
