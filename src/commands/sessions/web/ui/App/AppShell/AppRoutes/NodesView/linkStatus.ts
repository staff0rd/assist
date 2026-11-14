import type { LinkStatus } from "../../../../../../daemon/links/LinkStatus";
import { formatRelativeTime } from "../../../../formatRelativeTime";
import { protocolDirection } from "./protocolDirection";
import type { NodeStatus } from "./nodeStatus";

export function linkStatus(link: LinkStatus): NodeStatus | undefined {
	if (link.state === "disconnected")
		return {
			kind: "disconnected",
			label: "Disconnected",
			line: link.errorAt
				? `since ${formatRelativeTime(link.errorAt)} · update state unknown`
				: "update state unknown",
			attention: "error",
		};
	if (link.state === "connecting")
		return {
			kind: "connecting",
			label: "Connecting…",
			line: "waiting for the link",
		};
	if (link.state === "version-blocked")
		return {
			kind: "blocked",
			label: "Link blocked",
			line: `${protocolDirection(link)} link protocol · update it`,
			attention: "warning",
		};
	return undefined;
}
