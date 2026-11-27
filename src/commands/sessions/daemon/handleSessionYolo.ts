import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import type { Handler } from "./routed";
import { yoloEnabled } from "./yoloEnabled";

function describe(session: unknown, flag: boolean, yolo: boolean): string {
	if (!session) return "unknown session";
	if (!yolo) return "not yolo";
	return `yolo (${flag ? "session flag" : "sessions.yolo config"})`;
}

/** Whether a session runs yolo, from its own flag or its repo's `sessions.yolo` config. */
export const handleSessionYolo: Handler = (client, manager, data) => {
	const id = typeof data.sessionId === "string" ? data.sessionId : "";
	const session = manager.session(id);
	const flag = !!session?.yolo;
	const yolo = session ? flag || yoloEnabled(session.cwd) : false;
	daemonLog(
		`session-yolo: session ${id} lookup: ${describe(session, flag, yolo)}`,
	);
	sendTo(client, { type: "session-yolo", yolo });
};
