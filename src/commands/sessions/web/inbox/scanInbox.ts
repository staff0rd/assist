import type { IncomingMessage, ServerResponse } from "node:http";
import { harnessKindOf } from "../../../../shared/harnessKindOf";
import { respondJson } from "../../../../shared/web";
import { requestDaemonReply } from "../../daemon/requestDaemonReply";
import { linkedRequester } from "../linkedRequester";
import { readJsonBody } from "../readJsonBody";

async function requestedHarness(req: IncomingMessage) {
	const body = await readJsonBody(req).catch(() => ({}));
	return harnessKindOf((body as { harness?: unknown } | null)?.harness);
}

export async function scanInbox(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const harness = await requestedHarness(req);
	console.log(
		`inbox scan requested${harness ? ` with ${harness}` : ""} ${linkedRequester(req)}`,
	);
	const reply = await requestDaemonReply<{ started: boolean; error?: string }>(
		{ type: "inbox-scan", harness },
		"inbox-scan",
	);
	if (!reply) {
		respondJson(res, 503, { error: "Daemon not reachable" });
		return;
	}
	if (reply.error) {
		respondJson(res, 409, { error: reply.error });
		return;
	}
	respondJson(res, 200, { started: reply.started });
}
