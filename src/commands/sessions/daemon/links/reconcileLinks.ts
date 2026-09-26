import { daemonLog } from "../daemonLog";
import { describeTarget } from "./describeTarget";
import type { LinkSpec } from "./LinkStatus";
import type { NodeLink } from "./NodeLink";

function sameTarget(wanted: LinkSpec | undefined, current: LinkSpec) {
	return (
		wanted?.url === current.url &&
		JSON.stringify(wanted.ssh) === JSON.stringify(current.ssh)
	);
}

export function reconcileLinks(
	links: Map<string, NodeLink>,
	specs: LinkSpec[],
	create: (spec: LinkSpec) => NodeLink,
): void {
	const wanted = new Map(specs.map((spec) => [spec.name, spec]));
	for (const [name, link] of links) {
		if (sameTarget(wanted.get(name), link.spec)) continue;
		daemonLog(`link ${name}: removed`);
		link.dispose();
		links.delete(name);
	}
	for (const spec of specs) {
		if (links.has(spec.name)) continue;
		daemonLog(`link ${spec.name}: added (${describeTarget(spec)})`);
		const link = create(spec);
		links.set(spec.name, link);
		link.start();
	}
}
