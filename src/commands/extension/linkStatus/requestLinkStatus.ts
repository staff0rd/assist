import type { LinkRef } from "../../sessions/web/linkStatus/LinkState";
import { sendRuntimeMessage } from "../sendToAssist/sendRuntimeMessage";
import type { LinkStatusResult } from "./isLinkStatusMessage";

export function requestLinkStatus(refs: LinkRef[]): Promise<LinkStatusResult> {
	return sendRuntimeMessage<LinkStatusResult>({
		type: "assist-link-status",
		refs,
	});
}
