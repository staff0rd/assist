import {
	AUTO_UPDATE_ACTIONS,
	type AutoUpdateAction,
} from "../../shared/AutoUpdateAction";
import { sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import type { Handler } from "../routed";
import { applyAutoUpdateAction } from "./applyAutoUpdateAction";

function tryAction(action: unknown): string | undefined {
	if (!AUTO_UPDATE_ACTIONS.includes(action as AutoUpdateAction))
		return `unknown auto-update action ${String(action)}`;
	try {
		return applyAutoUpdateAction(action as AutoUpdateAction);
	} catch (error) {
		return error instanceof Error ? error.message : String(error);
	}
}

export const handleAutoUpdateControl: Handler = (client, _m, d) => {
	const error = tryAction(d.action);
	daemonLog(`auto-update-control ${String(d.action)}: ${error ?? "ok"}`);
	sendTo(client, { type: "auto-update-control", ok: !error, error });
};
