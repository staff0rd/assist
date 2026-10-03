import type { LinkSpec } from "../daemon/links/LinkStatus";
import { failed, type Hop, type PeerHealth, passed } from "./DoctorProbes";

export function peerDaemonHop(spec: LinkSpec, health: PeerHealth): Hop {
	if (health.daemon?.reachable) return passed("daemon", "reachable");
	return failed(
		"daemon",
		`${spec.name}'s web server reports its daemon unreachable`,
		`run \`assist daemon status\` on ${spec.name}; restarting its web server starts the daemon`,
	);
}
