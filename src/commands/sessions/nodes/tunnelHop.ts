import type { LinkSpec, SshTarget } from "../daemon/links/LinkStatus";
import { type DoctorProbes, failed, type Hop, passed } from "./DoctorProbes";

export async function tunnelHop(
	spec: LinkSpec,
	ssh: SshTarget,
	probes: DoctorProbes,
): Promise<Hop> {
	const bound = `127.0.0.1:${ssh.localPort}`;
	if (await probes.tunnel(ssh.localPort))
		return passed("tunnel", `${bound} → ${ssh.alias}:${ssh.port}`);
	return failed(
		"tunnel",
		`nothing bound on ${bound}`,
		`this node's daemon keeps \`ssh -N -L ${ssh.localPort}:127.0.0.1:${ssh.port} ${ssh.alias}\` up — run \`assist daemon restart\` and check daemon.log for \`link ${spec.name} tunnel:\` and \`link ${spec.name} ssh:\` lines`,
	);
}
