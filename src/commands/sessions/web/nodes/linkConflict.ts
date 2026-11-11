import type { LinkSpec } from "../../daemon/links/LinkStatus";
import { resolveNodeName } from "../../shared/resolveNodeName";

export function linkConflict(
	name: string,
	url: string,
	links: LinkSpec[],
): string | null {
	if (name.includes(":")) return `Node name ${name} cannot contain ':'`;
	if (name === resolveNodeName())
		return `${name} is this node; enter another machine's URL`;
	const existing = links.find((link) => link.name === name || link.url === url);
	if (existing) return `${existing.name} is already linked at ${existing.url}`;
	return null;
}
