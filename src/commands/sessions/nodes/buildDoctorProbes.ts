import type { NodesMessage } from "../daemon/links/LinkStatus";
import type { DoctorProbes } from "./DoctorProbes";
import { fetchPeerJson } from "./fetchPeerJson";
import { probePeerHello } from "./probePeerHello";
import { tailscaleStatus } from "./tailscaleStatus";

export function buildDoctorProbes(
	live: NodesMessage | undefined,
): DoctorProbes {
	return {
		health: (url) => fetchPeerJson(url, "/api/health"),
		hello: probePeerHello,
		tailscale: tailscaleStatus,
		linkState: (name) => {
			if (!live) return "no-daemon";
			return live.links.find((l) => l.name === name) ?? "unknown-link";
		},
	};
}
