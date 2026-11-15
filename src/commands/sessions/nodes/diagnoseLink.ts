import type { LinkSpec } from "../daemon/links/LinkStatus";
import {
	type DoctorProbes,
	type Hop,
	type LinkDiagnosis,
} from "./DoctorProbes";
import { helloHop } from "./helloHop";
import { linkStateHop } from "./linkStateHop";
import { tailscaleHop } from "./tailscaleHop";
import { webHop } from "./webHop";
import { peerDaemonHop } from "./peerDaemonHop";
import { isTailscaleLink } from "./isTailscaleLink";

export async function diagnoseLink(
	spec: LinkSpec,
	probes: DoctorProbes,
): Promise<LinkDiagnosis> {
	const hops: Hop[] = [];
	const health: { runtime?: LinkDiagnosis["runtime"] } = {};
	const done = () => ({
		...spec,
		ok: hops.every((h) => h.ok),
		hops,
		...(health.runtime && { runtime: health.runtime }),
	});
	if (isTailscaleLink(spec)) {
		hops.push(await tailscaleHop(spec, probes));
		if (!hops.at(-1)?.ok) return done();
	}
	const web = await webHop(spec, probes);
	hops.push(web.hop);
	if (!web.health) return done();
	health.runtime = web.health.daemon?.runtime;
	hops.push(peerDaemonHop(spec, web.health));
	if (!hops.at(-1)?.ok) return done();
	hops.push(await helloHop(spec, probes));
	if (!hops.at(-1)?.ok) return done();
	hops.push(linkStateHop(spec, probes));
	return done();
}
