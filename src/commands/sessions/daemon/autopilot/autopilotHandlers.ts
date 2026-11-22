import { sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import type { Handler } from "../routed";
import { autopilotScheduler } from "./autopilotScheduler";

const actions = {
	pause: (cwd: string) => autopilotScheduler.setPaused(cwd, true),
	resume: (cwd: string) => autopilotScheduler.setPaused(cwd, false),
	run: (cwd: string) => autopilotScheduler.runNow(cwd),
};

function isAction(value: unknown): value is keyof typeof actions {
	return typeof value === "string" && Object.hasOwn(actions, value);
}

export const autopilotHandlers: Record<string, Handler> = {
	"autopilot-status": (client, _manager, data) => {
		const cwd = typeof data.cwd === "string" ? data.cwd : undefined;
		sendTo(client, {
			type: "autopilot-status",
			...(cwd
				? { status: autopilotScheduler.status(cwd) ?? null }
				: { statuses: autopilotScheduler.statuses() }),
		});
	},
	"autopilot-control": (client, _manager, data) => {
		const { cwd, action } = data;
		if (typeof cwd !== "string" || !isAction(action)) {
			sendTo(client, {
				type: "autopilot-control",
				ok: false,
				error:
					"autopilot-control needs a cwd and an action of pause, resume or run",
			});
			return;
		}
		daemonLog(`autopilot: ${action} requested for ${cwd}`);
		const result = actions[action](cwd);
		if (!result.ok) daemonLog(`autopilot: ${action} refused: ${result.error}`);
		sendTo(client, { type: "autopilot-control", ...result });
	},
};
