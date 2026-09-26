import type { LinkSpec } from "../daemon/links/LinkStatus";
import {
	type DoctorProbes,
	failed,
	type Hop,
	type PeerHealth,
	passed,
} from "./DoctorProbes";
import { describePeerError, peerErrorCode } from "./fetchPeerJson";

function webRemediation(spec: LinkSpec, error: unknown): string {
	if (spec.ssh && (error as { status?: number }).status === undefined)
		return `nothing listening on ${spec.ssh.port} on ${spec.ssh.alias} — is project-switch running ${spec.name}'s web server?`;
	const { hostname, port } = new URL(spec.url);
	switch (peerErrorCode(error)) {
		case "ECONNREFUSED":
			return `nothing listening on ${port} on ${hostname} — is ${spec.name}'s web server running (project-switch webservers)?`;
		case "ETIMEDOUT":
			return `${hostname}:${port} did not answer — is ${spec.name} up and the port reachable from here?`;
		case "ENOTFOUND":
			return `cannot resolve ${hostname} — fix the url with \`assist sessions nodes link ${spec.name} <url>\``;
	}
	if ((error as { status?: number }).status === 404)
		return `${spec.name}'s web server has no /api/health — run \`assist update\` on ${spec.name}`;
	return `check the link url ${spec.url} with \`assist sessions nodes\``;
}

export async function webHop(
	spec: LinkSpec,
	probes: DoctorProbes,
): Promise<{ hop: Hop; health?: PeerHealth }> {
	let health: PeerHealth;
	try {
		health = await probes.health(spec.url);
	} catch (error) {
		return {
			hop: failed("web", describePeerError(error), webRemediation(spec, error)),
		};
	}
	if (health.nodeName !== spec.name)
		return {
			hop: failed(
				"web",
				`peer reports nodeName ${health.nodeName}, link expects ${spec.name}`,
				`relink with \`assist sessions nodes unlink ${spec.name}\` then \`assist sessions nodes link ${health.nodeName} ${spec.ssh ? `--ssh ${spec.ssh.alias} --port ${spec.ssh.port}` : spec.url}\`, or set sessions.nodeName on the peer`,
			),
		};
	return {
		hop: passed(
			"web",
			`${health.nodeName} ${health.version} (protocol ${health.protocol})`,
		),
		health,
	};
}
