import type { LinkSpec } from "../daemon/links/LinkStatus";

export function tailscaleServeRemediation(
	spec: LinkSpec,
	error: unknown,
): string | undefined {
	const status = (error as { status?: number }).status;
	if (status !== undefined && status !== 502) return undefined;
	const { hostname, port } = new URL(spec.url);
	const servePort = port || "443";
	return status === 502
		? `tailscale serve on ${hostname} answered but nothing listens on 127.0.0.1:${servePort} behind it — is ${spec.name}'s web server running (project-switch webservers)?`
		: `nothing serves https on ${servePort} on ${hostname} — ${spec.name}'s web server runs tailscale serve when it starts: check the \`tailscale serve:\` line in its log (project-switch "View logs") and that sessions.tailscaleServe is not false there`;
}
