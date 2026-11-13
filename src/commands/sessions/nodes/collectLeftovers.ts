import type { LinkSpec } from "../daemon/links/LinkStatus";
import { leftoverReport } from "../daemon/worktree/leftoverReport";
import type { LeftoverReport } from "../shared/LeftoverReport";
import { fetchPeerJson } from "./fetchPeerJson";

/** This node's leftovers plus each reachable linked peer's; a peer that cannot
 * answer (down, or too old for /api/leftovers) is left out. */
export async function collectLeftovers(
	specs: LinkSpec[],
	fetchPeer: (url: string) => Promise<LeftoverReport> = (url) =>
		fetchPeerJson(url, "/api/leftovers"),
): Promise<LeftoverReport[]> {
	const peers = await Promise.all(
		specs.map((spec) => fetchPeer(spec.url).catch(() => undefined)),
	);
	return [leftoverReport(), ...peers].filter(
		(r): r is LeftoverReport => r !== undefined && r.leftovers.length > 0,
	);
}
