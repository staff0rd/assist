import type { TailscalePeer, TailscaleStatus } from "./tailscaleStatus";

export function findTailscalePeer(
	status: TailscaleStatus,
	hostname: string,
): TailscalePeer | undefined {
	const nodes = [
		...(status.Self ? [{ ...status.Self, Online: true }] : []),
		...Object.values(status.Peer ?? {}),
	];
	return nodes.find(
		(node) => node.DNSName?.replace(/\.$/, "").toLowerCase() === hostname,
	);
}
