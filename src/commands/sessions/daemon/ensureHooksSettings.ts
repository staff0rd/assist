import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { daemonPaths } from "./daemonPaths";

const SET_STATUS = "assist sessions set-status";

function running(source: string): string {
	return `${SET_STATUS} running --source ${source}`;
}
function waiting(source: string): string {
	return `${SET_STATUS} waiting --source ${source}`;
}
function ackWaiting(source: string): string {
	return `${SET_STATUS} waiting --source ${source} --ack`;
}

function on(command: string, matcher?: string) {
	const hooks = [{ type: "command", command }];
	return [matcher == null ? { hooks } : { matcher, hooks }];
}

const ASK_USER_QUESTION = "AskUserQuestion";
const NOT_ASK_USER_QUESTION = `^(?!${ASK_USER_QUESTION}$).*`;

const hooksSettings = {
	hooks: {
		UserPromptSubmit: on(running("prompt")),
		PreToolUse: [
			...on(waiting("pretool"), ASK_USER_QUESTION),
			...on(running("pretool"), NOT_ASK_USER_QUESTION),
		],
		PostToolUse: on(running("posttool")),
		Stop: on(ackWaiting("stop")),
		Notification: on(ackWaiting("notification")),
		PermissionRequest: on(ackWaiting("permission")),
	},
};

export function ensureHooksSettings(): string {
	const path = daemonPaths.hooksSettings;
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, JSON.stringify(hooksSettings, null, 2));
	return path;
}
