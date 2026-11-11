import type { LinkStatus } from "../../../../../../daemon/links/LinkStatus";

export function protocolDirection(
	link: LinkStatus,
): "older" | "newer" | "different" {
	if (link.peerProtocol === undefined || link.protocol === undefined)
		return "different";
	return link.peerProtocol < link.protocol ? "older" : "newer";
}
