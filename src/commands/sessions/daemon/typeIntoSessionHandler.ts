import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { routeToLinkedSession } from "./links/routeToLinkedSession";
import type { Handler } from "./routed";
import type { SessionManager } from "./SessionManager";
import type { TypePromptReply } from "./typePromptReply";

type Msg = Record<string, unknown>;

type TypeIntoSession = (
	m: SessionManager,
	id: string,
	text: string,
) => TypePromptReply;

export function typeIntoSessionHandler(
	label: string,
	typeInto: TypeIntoSession,
	prepare: (m: SessionManager, request: Msg) => Msg = (_, request) => request,
): Handler {
	return (client, m, data) => {
		const request = prepare(m, data);
		const requestId = request.requestId;
		const d = routeToLinkedSession(
			client,
			m.links,
			request,
			(sessionId, reason) => ({
				type: "type-prompt-result",
				ok: false,
				message: `Cannot reach session ${sessionId}: ${reason}`,
				requestId,
			}),
		);
		if (!d) return;
		const reply = typeInto(m, String(d.sessionId), String(d.text ?? ""));
		if (!reply.ok) daemonLog(`${label} refused: ${reply.message}`);
		sendTo(client, { type: "type-prompt-result", ...reply, requestId });
	};
}
