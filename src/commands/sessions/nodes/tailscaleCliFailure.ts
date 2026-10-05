import { failed, type Hop } from "./DoctorProbes";
import { describePeerError } from "./fetchPeerJson";

export function tailscaleCliFailure(error: unknown, cli: string): Hop {
	const detail = describePeerError(error);
	const owner = /Tailscale already in use by (\S+?),/.exec(detail)?.[1];
	if (owner)
		return failed(
			"tailscale",
			`Tailscale on this node is signed in by Windows user ${owner}, so it is disconnected while another user is active`,
			`sign in to Windows as ${owner} and run \`${cli} up --unattended\` (or tick "Run unattended" in Tailscale's menu) so it stays connected for every user; otherwise sign ${owner} out and run \`${cli} up\` as this user`,
		);
	return failed(
		"tailscale",
		detail,
		`\`${cli} status --json\` failed — install Tailscale on this node and sign in with \`${cli} up\``,
	);
}
