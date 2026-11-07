import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import type { AutoUpdateReply } from "../../shared/AutoUpdateLoopState";
import { requestViaLink } from "./requestViaLink";

export async function linkUpdateStatus(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const reply = await requestViaLink<AutoUpdateReply>(req, "auto-update");
	if (!reply) {
		respondJson(res, 503, { error: "Daemon link did not answer" });
		return;
	}
	respondJson(res, 200, reply);
}
