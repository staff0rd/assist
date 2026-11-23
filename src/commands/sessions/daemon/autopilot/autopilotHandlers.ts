import { sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import type { Handler } from "../routed";
import { autopilotScheduler } from "./autopilotScheduler";
import { handleAutopilotFailure } from "./handleAutopilotFailure";
import { handleAutopilotSummary } from "./handleAutopilotSummary";

const actions = {
	pause: (cwd: string) => autopilotScheduler.setPaused(cwd, true),
	resume: (cwd: string) => autopilotScheduler.setPaused(cwd, false),
	run: (cwd: string) => autopilotScheduler.runNow(cwd),
	"resume-item": (cwd: string, itemId: unknown) =>
		typeof itemId === "number"
			? autopilotScheduler.resumeItem(cwd, itemId)
			: { ok: false as const, error: "resume-item needs an itemId" },
	stop: (cwd: string, itemId: unknown) =>
		autopilotScheduler.stopItem(
			cwd,
			typeof itemId === "number" ? itemId : undefined,
		),
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
	"autopilot-session": (client, manager, data) => {
		const id = typeof data.sessionId === "string" ? data.sessionId : "";
		sendTo(client, {
			type: "autopilot-session",
			autopilot: !!manager.session(id)?.autopilot,
		});
	},
	"autopilot-follow-up": (client, _manager, data) => {
		const { sessionId, delayMs } = data;
		const result =
			typeof sessionId === "string" &&
			typeof delayMs === "number" &&
			delayMs > 0
				? autopilotScheduler.followUp(sessionId, delayMs)
				: {
						ok: false,
						error:
							"autopilot-follow-up needs a sessionId and a positive delayMs",
					};
		if (!result.ok) daemonLog(`autopilot: follow-up refused: ${result.error}`);
		sendTo(client, { type: "autopilot-follow-up", ...result });
	},
	"autopilot-summary": handleAutopilotSummary,
	"autopilot-failure": handleAutopilotFailure,
	"autopilot-control": (client, _manager, data) => {
		const { cwd, action, itemId } = data;
		if (typeof cwd !== "string" || !isAction(action)) {
			sendTo(client, {
				type: "autopilot-control",
				ok: false,
				error:
					"autopilot-control needs a cwd and an action of pause, resume, run, stop or resume-item",
			});
			return;
		}
		daemonLog(
			`autopilot: ${action} requested for ${cwd}${itemId === undefined ? "" : ` item ${itemId}`}`,
		);
		const result = actions[action](cwd, itemId);
		if (!result.ok) daemonLog(`autopilot: ${action} refused: ${result.error}`);
		sendTo(client, { type: "autopilot-control", ...result });
	},
};
