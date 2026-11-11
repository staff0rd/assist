import type { LinkStatus } from "../../../../../../daemon/links/LinkStatus";

export function nodesSummary(links: LinkStatus[]): string {
	if (links.length === 0)
		return "Only this node · link another machine to run sessions on it from here";
	const up = links.filter((link) => link.state === "connected").length;
	return `This node and ${links.length} linked · ${up} connected`;
}
