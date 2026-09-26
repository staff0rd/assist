import { type SessionClient, sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import type { NodeLink } from "./NodeLink";
import { resolveLinkTarget } from "./resolveLinkTarget";

export function routeToLink(
	links: Map<string, NodeLink>,
	localNode: string,
	client: SessionClient,
	data: Record<string, unknown>,
): boolean {
	const target = resolveLinkTarget(data, localNode, (node) => links.has(node));
	if (target.kind === "local") return false;
	const link = links.get(target.node);
	if (link) {
		link.route(client, data);
		return true;
	}
	daemonLog(`link routing: ${data.type} names unknown node ${target.node}`);
	sendTo(client, { type: "error", message: `No link to node ${target.node}` });
	return true;
}
