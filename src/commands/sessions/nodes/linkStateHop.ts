import type { LinkSpec } from "../daemon/links/LinkStatus";
import { type DoctorProbes, failed, type Hop, passed } from "./DoctorProbes";

export function linkStateHop(spec: LinkSpec, probes: DoctorProbes): Hop {
	const status = probes.linkState(spec.name);
	if (status === "no-daemon")
		return failed(
			"link",
			"this node's daemon is not running",
			"links run in the daemon — start this node's web server or run `assist daemon restart`",
		);
	if (status === "unknown-link")
		return failed(
			"link",
			`this node's daemon has no link named ${spec.name}`,
			"the daemon has not loaded sessions.links — run `assist daemon restart`",
		);
	if (status.state === "connected") return passed("link", "connected");
	const error = status.error ?? status.state;
	if (status.state === "version-blocked")
		return failed("link", error, `version mismatch — heal latched. ${error}`);
	return failed(
		"link",
		error,
		`every probe passed but the daemon's link is ${status.state}; it retries behind the circuit breaker — check this node's daemon.log for \`link ${spec.name} ws:\` lines`,
	);
}
