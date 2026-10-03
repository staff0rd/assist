import { type TailscaleStatus, tailscaleCli } from "./tailscaleStatus";

export function tailnetSuffix(status: TailscaleStatus): string {
	if (status.BackendState !== "Running")
		throw new Error(
			`Tailscale is not running on this node (${status.BackendState ?? "unknown state"}) — run \`${tailscaleCli()} up\``,
		);
	const suffix =
		status.CurrentTailnet?.MagicDNSSuffix ?? status.MagicDNSSuffix ?? "";
	if (status.CurrentTailnet?.MagicDNSEnabled === false || !suffix)
		throw new Error(
			"MagicDNS is off in this tailnet — turn on MagicDNS and HTTPS certificates on the DNS page of the Tailscale admin console",
		);
	return suffix.replace(/\.$/, "");
}
