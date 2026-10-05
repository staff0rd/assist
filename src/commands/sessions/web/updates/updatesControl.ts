import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { requestDaemonReply } from "../../daemon/requestDaemonReply";
import {
	AUTO_UPDATE_ACTIONS,
	type AutoUpdateAction,
} from "../../shared/AutoUpdateAction";
import { linkedRequester } from "../linkedRequester";

type ControlReply = { ok: boolean; error?: string };

export async function updatesControl(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const url = new URL(req.url ?? "/", "http://localhost");
	const action = url.searchParams.get("action");
	if (!AUTO_UPDATE_ACTIONS.includes(action as AutoUpdateAction)) {
		respondJson(res, 400, { error: "Invalid action" });
		return;
	}
	console.log(`auto-update ${action} ${linkedRequester(req)}`);
	const reply = await requestDaemonReply<ControlReply>(
		{ type: "auto-update-control", action },
		"auto-update-control",
	);
	if (!reply) {
		respondJson(res, 503, { error: "Daemon not reachable" });
		return;
	}
	if (!reply.ok) {
		respondJson(res, 409, { error: reply.error ?? `${action} failed` });
		return;
	}
	respondJson(res, 200, { ok: true });
}
