import type { LinkSpec } from "../daemon/links/LinkStatus";
import { type DoctorProbes, failed, type Hop, passed } from "./DoctorProbes";
import { describePeerError } from "./fetchPeerJson";
import { type TailscaleStatus, tailscaleCli } from "./tailscaleStatus";
import { findTailscalePeer } from "./findTailscalePeer";

export async function tailscaleHop(
	spec: LinkSpec,
	probes: DoctorProbes,
): Promise<Hop> {
	const cli = tailscaleCli();
	let status: TailscaleStatus;
	try {
		status = await probes.tailscale();
	} catch (error) {
		return failed(
			"tailscale",
			describePeerError(error),
			`\`${cli} status --json\` failed — install Tailscale on this node and sign in with \`${cli} up\``,
		);
	}
	if (status.BackendState !== "Running")
		return failed(
			"tailscale",
			`Tailscale on this node is ${status.BackendState ?? "not running"}`,
			`run \`${cli} up\` on this node`,
		);
	const { hostname } = new URL(spec.url);
	const peer = findTailscalePeer(status, hostname);
	if (!peer)
		return failed(
			"tailscale",
			`${hostname} is not in this node's tailnet`,
			`check the host in \`${cli} status\`, then relink with \`assist sessions nodes link ${spec.name} --tailscale <host> --port <port>\``,
		);
	if (!peer.Online)
		return failed(
			"tailscale",
			`${hostname} is offline in the tailnet`,
			`is ${spec.name}'s machine awake with Tailscale running and signed in?`,
		);
	return passed(
		"tailscale",
		`${hostname} online${peer.TailscaleIPs?.[0] ? ` (${peer.TailscaleIPs[0]})` : ""}`,
	);
}
