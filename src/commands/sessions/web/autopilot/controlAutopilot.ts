import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { requestDaemonReply } from "../../daemon/requestDaemonReply";
import { linkedRequester } from "../linkedRequester";
import { readJsonBody } from "../readJsonBody";

type ControlBody = { cwd?: unknown; action?: unknown };

export async function controlAutopilot(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const body = (await readJsonBody(req).catch(
		() => null,
	)) as ControlBody | null;
	const { cwd, action } = body ?? {};
	if (typeof cwd !== "string" || typeof action !== "string") {
		respondJson(res, 400, { error: "Expected { cwd, action }" });
		return;
	}
	console.log(
		`autopilot ${action} requested for ${cwd} ${linkedRequester(req)}`,
	);
	const reply = await requestDaemonReply<{ ok: boolean; error?: string }>(
		{ type: "autopilot-control", cwd, action },
		"autopilot-control",
	);
	if (!reply) {
		respondJson(res, 503, { error: "Daemon not reachable" });
		return;
	}
	respondJson(res, reply.ok ? 200 : 409, reply);
}
