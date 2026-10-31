import { parseAddNodeLink } from "../parseAddNodeLink";
import { type NodeHealth, probeHealth } from "../probeHealth";
import type { SavedNode } from "../SavedNode";

type Resolved =
	| { ok: true; node: SavedNode; health: NodeHealth }
	| { ok: false; error: string };

export async function resolveAddNodeLink(
	link: string,
	onProbing: (node: SavedNode) => void,
): Promise<Resolved> {
	const parsed = parseAddNodeLink(link);
	if (!parsed.ok) return parsed;
	const { node } = parsed;
	onProbing(node);
	const result = await probeHealth(node.url);
	if (!result.ok)
		return {
			ok: false,
			error: `Can't reach ${node.name} at ${node.url}: ${result.error}`,
		};
	return { ok: true, node, health: result.health };
}
