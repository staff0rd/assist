import type { LinkSpec } from "../daemon/links/LinkStatus";
import {
	type DoctorProbes,
	type Hop,
	type LinkDiagnosis,
} from "./DoctorProbes";
import { agentHop } from "./agentHop";
import { helloHop } from "./helloHop";
import { linkStateHop } from "./linkStateHop";
import { sshHop } from "./sshHop";
import { tailscaleHop } from "./tailscaleHop";
import { tunnelHop } from "./tunnelHop";
import { webHop } from "./webHop";
import { peerDaemonHop } from "./peerDaemonHop";
import { isTailscaleLink } from "./isTailscaleLink";

export async function diagnoseLink(
	spec: LinkSpec,
	probes: DoctorProbes,
): Promise<LinkDiagnosis> {
	const hops: Hop[] = [];
	const done = () => ({ ...spec, ok: hops.every((h) => h.ok), hops });
	if (spec.ssh) {
		const { ssh } = spec;
		for (const probe of [
			() => agentHop(ssh, probes),
			() => sshHop(ssh, probes),
			() => tunnelHop(spec, ssh, probes),
		]) {
			hops.push(await probe());
			if (!hops.at(-1)?.ok) return done();
		}
	}
	if (isTailscaleLink(spec)) {
		hops.push(await tailscaleHop(spec, probes));
		if (!hops.at(-1)?.ok) return done();
	}
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
