import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import type { AutopilotStatus } from "../../daemon/autopilot/AutopilotStatus";
import { requestDaemonReply } from "../../daemon/requestDaemonReply";
import { applyCwdFromReq } from "../../../backlog/web/applyCwdFromReq";
import { getCwdParam } from "../getCwdParam";
import { loadAutopilotItems } from "./loadAutopilotItems";

export async function autopilotStatus(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	const reply = await requestDaemonReply<{ status: AutopilotStatus | null }>(
		{ type: "autopilot-status", cwd },
		"autopilot-status",
	);
	if (!reply) {
		respondJson(res, 503, { error: "Daemon not reachable" });
		return;
	}
	applyCwdFromReq(req);
	const items = reply.status
		? await loadAutopilotItems(reply.status).catch((error: unknown) => {
				console.log(`autopilot: loading items failed: ${String(error)}`);
				return [];
			})
		: [];
	respondJson(res, 200, { status: reply.status, items });
}
