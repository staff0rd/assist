import { linksChangedNotice } from "../linksChangedNotice";
import { type DaemonReload, postNodesApi } from "../postNodesApi";
import type { FoundNode } from "./FoundNode";

export async function linkFoundNode(node: FoundNode): Promise<string> {
	const { daemon } = await postNodesApi<{ daemon: DaemonReload }>("link", {
		name: node.name,
		url: node.url,
	});
	return linksChangedNotice(`Linked ${node.name}`, daemon);
}
