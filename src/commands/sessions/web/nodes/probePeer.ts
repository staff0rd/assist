import { PROTOCOL_VERSION } from "../../daemon/buildHello";
import type { PeerHealth } from "../../nodes/DoctorProbes";
import { describePeerError, fetchPeerJson } from "../../nodes/fetchPeerJson";
import { readLinks } from "../../nodes/readLinks";
import { linkConflict } from "./linkConflict";
import { tryParseLinkUrl } from "./tryParseLinkUrl";

type ProbeResult =
	| { ok: true; name: string; version: string; url: string }
	| { ok: false; error: string };

function refuse(error: string): ProbeResult {
	return { ok: false, error };
}

export async function probePeer(raw: string): Promise<ProbeResult> {
	const url = tryParseLinkUrl(raw);
	if (!url) return refuse(`${raw} is not an http(s) URL`);
	let health: PeerHealth;
	try {
		health = await fetchPeerJson<PeerHealth>(url, "/api/health");
	} catch (error) {
		return refuse(`Could not reach ${url}: ${describePeerError(error)}`);
	}
	const name = health.nodeName;
	if (!name)
		return refuse(
			`${url} did not report a node name; is it an assist web server?`,
		);
	const conflict = linkConflict(name, url, await readLinks());
	if (conflict) return refuse(conflict);
	const protocol = health.protocol ?? 0;
	if (protocol < PROTOCOL_VERSION)
		return refuse(
			`${name} runs an older link protocol (${protocol}, this node ${PROTOCOL_VERSION}); run assist update on ${name} first`,
		);
	return { ok: true, name, version: health.version ?? "unknown", url };
}
