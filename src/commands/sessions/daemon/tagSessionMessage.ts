import { wrapSessionMessage } from "../shared/wrapSessionMessage";
import {
	splitNodeSessionId,
	toNodeSessionId,
} from "./links/splitNodeSessionId";
import type { SessionManager } from "./SessionManager";

type Msg = Record<string, unknown>;

/* why: wrapped here, before routing, because only this daemon knows the
 * sender; a linked peer receives the already-tagged text. */
export function tagSessionMessage(m: SessionManager, request: Msg): Msg {
	const { fromSessionId, ...rest } = request;
	if (typeof fromSessionId !== "string") return rest;
	const sender = m.io.sender(fromSessionId);
	if (!sender) return rest;
	const localNode = m.links.localNode();
	const target = splitNodeSessionId(String(rest.sessionId ?? ""));
	const from =
		target && target.node !== localNode
			? toNodeSessionId(localNode, sender.id)
			: sender.id;
	return {
		...rest,
		text: wrapSessionMessage(String(rest.text ?? ""), from, sender.agent),
	};
}
