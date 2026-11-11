import type { LinkStatus } from "../../../../../../daemon/links/LinkStatus";
import type { NodesState } from "../../../../types";
import type { NodeUpdateEntry } from "../../NodeUpdateEntry";
import { type NodeStatus, nodeStatus } from "./nodeStatus";

export type NodeRowData = {
	name: string;
	local: boolean;
	url: string;
	link?: LinkStatus;
	entry?: NodeUpdateEntry;
	status: NodeStatus;
};

export function nodeRows(
	nodes: NodesState,
	entries: NodeUpdateEntry[],
	removed: ReadonlySet<string>,
	origin: string,
): NodeRowData[] {
	const entryFor = (name: string) => entries.find((e) => e.name === name);
	const self = entryFor(nodes.local);
	const linked = nodes.links
		.filter((link) => !removed.has(link.name))
		.map((link) => {
			const entry =
				link.state === "connected" ? entryFor(link.name) : undefined;
			return {
				name: link.name,
				local: false,
				url: link.url,
				link,
				entry,
				status: nodeStatus(link, entry),
			};
		});
	return [
		{
			name: nodes.local,
			local: true,
			url: origin,
			entry: self,
			status: nodeStatus(undefined, self),
		},
		...linked,
	];
}
