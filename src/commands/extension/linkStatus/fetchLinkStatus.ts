import type { LinkStates } from "../../sessions/web/linkStatus/LinkState";
import { postAssistJson } from "../sendToAssist/postAssistJson";
import type {
	LinkStatusMessage,
	LinkStatusResult,
} from "./isLinkStatusMessage";

export async function fetchLinkStatus(
	server: string,
	{ refs }: LinkStatusMessage,
): Promise<LinkStatusResult> {
	const result = await postAssistJson<{ states?: LinkStates }>(
		server,
		"/api/link-status",
		{ refs },
	);
	if (!result.ok) return result;
	const { states } = result.data;
	if (!states || typeof states !== "object")
		return { ok: false, message: "assist web server returned no states" };
	return { ok: true, states };
}
