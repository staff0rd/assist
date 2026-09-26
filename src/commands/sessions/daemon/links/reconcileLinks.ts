import { daemonLog } from "../daemonLog";
import type { LinkSpec } from "./LinkStatus";
import type { NodeLink } from "./NodeLink";

export function reconcileLinks(
	links: Map<string, NodeLink>,
	specs: LinkSpec[],
	create: (spec: LinkSpec) => NodeLink,
): void {
	const wanted = new Map(specs.map((spec) => [spec.name, spec]));
	for (const [name, link] of links) {
		if (wanted.get(name)?.url === link.spec.url) continue;
		daemonLog(`link ${name}: removed`);
		link.dispose();
		links.delete(name);
	}
	for (const spec of specs) {
		if (links.has(spec.name)) continue;
		daemonLog(`link ${spec.name}: added (${spec.url})`);
		const link = create(spec);
		links.set(spec.name, link);
		link.start();
	}
}
