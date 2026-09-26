import type { LinkSpec } from "../daemon/links/LinkStatus";
import {
	type DoctorProbes,
	failed,
	type Hop,
	type LinkDiagnosis,
	type PeerHealth,
	passed,
} from "./DoctorProbes";
import { helloHop } from "./helloHop";
import { linkStateHop } from "./linkStateHop";
import { webHop } from "./webHop";

function peerDaemonHop(spec: LinkSpec, health: PeerHealth): Hop {
	if (health.daemon?.reachable) return passed("daemon", "reachable");
	return failed(
		"daemon",
		`${spec.name}'s web server reports its daemon unreachable`,
		`run \`assist daemon status\` on ${spec.name}; restarting its web server starts the daemon`,
	);
}

export async function diagnoseLink(
	spec: LinkSpec,
	probes: DoctorProbes,
): Promise<LinkDiagnosis> {
	const hops: Hop[] = [];
	const done = () => ({ ...spec, ok: hops.every((h) => h.ok), hops });
	const web = await webHop(spec, probes);
	hops.push(web.hop);
	if (!web.health) return done();
	hops.push(peerDaemonHop(spec, web.health));
	if (!hops.at(-1)?.ok) return done();
	hops.push(await helloHop(spec, probes));
	if (!hops.at(-1)?.ok) return done();
	hops.push(linkStateHop(spec, probes));
	return done();
}
