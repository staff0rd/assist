import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { linkedRequester } from "../linkedRequester";
import { requestViaLink } from "./requestViaLink";

type RestartReply = { ok: boolean; error?: string };

export async function restartWebViaLink(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const node = new URL(req.url ?? "/", "http://localhost").searchParams.get(
		"node",
	);
	console.log(
		`restart webserver of ${node ?? "this node"} via daemon link ${linkedRequester(req)}`,
	);
	const reply = await requestViaLink<RestartReply>(req, "restart-webserver");
	if (!reply) {
		respondJson(res, 503, { error: "Daemon link did not answer" });
		return;
	}
	if (!reply.ok) {
		respondJson(res, 409, { error: reply.error ?? "restart failed" });
		return;
	}
	respondJson(res, 200, { ok: true });
}
