import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { requestDaemonReply } from "../../daemon/requestDaemonReply";
import { linkedRequester } from "../linkedRequester";

export async function scanInbox(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	console.log(`inbox scan requested ${linkedRequester(req)}`);
	const reply = await requestDaemonReply<{ started: boolean }>(
		{ type: "inbox-scan" },
		"inbox-scan",
	);
	if (!reply) {
		respondJson(res, 503, { error: "Daemon not reachable" });
		return;
	}
	respondJson(res, 200, { started: reply.started });
}
