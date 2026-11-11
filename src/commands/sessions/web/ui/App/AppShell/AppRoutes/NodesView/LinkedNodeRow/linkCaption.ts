import type { LinkStatus } from "../../../../../../../daemon/links/LinkStatus";
import { formatRelativeTime } from "../../../../../formatRelativeTime";

export function linkCaption(link: LinkStatus): string | undefined {
	if (link.peerVersion) return `assist ${link.peerVersion}`;
	if (link.state === "disconnected" && link.errorAt)
		return `since ${formatRelativeTime(link.errorAt)}`;
	return undefined;
}
