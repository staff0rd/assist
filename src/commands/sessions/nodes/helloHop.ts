import {
	ASSIST_VERSION,
	helloCompatible,
	helloMismatchKind,
	isHello,
	PROTOCOL_VERSION,
} from "../daemon/buildHello";
import { linkVersionCheck } from "../daemon/links/linkVersionCheck";
import type { LinkSpec } from "../daemon/links/LinkStatus";
import { type DoctorProbes, failed, type Hop, passed } from "./DoctorProbes";
import { describePeerError } from "./fetchPeerJson";

export async function helloHop(
	spec: LinkSpec,
	probes: DoctorProbes,
): Promise<Hop> {
	let msg: Record<string, unknown>;
	try {
		msg = await probes.hello(spec.url);
	} catch (error) {
		return failed(
			"ws",
			describePeerError(error),
			`${spec.name}'s /api/health answers but its /ws does not — restart the web server on ${spec.name}, then check \`assist sessions nodes logs ${spec.name}\``,
		);
	}
	if (!isHello(msg))
		return failed(
			"ws",
			`malformed hello: ${JSON.stringify(msg)}`,
			`run \`assist update\` on ${spec.name}`,
		);
	const detail = `hello ${msg.version} (protocol ${msg.protocol ?? "legacy"})`;
	if (helloCompatible(msg)) return passed("ws", detail);
	const mismatch = `${helloMismatchKind(msg)} mismatch: peer ${msg.version} (protocol ${msg.protocol ?? "legacy"}), this node ${ASSIST_VERSION} (protocol ${PROTOCOL_VERSION})`;
	const mode = linkVersionCheck();
	if (mode !== "block")
		return passed(
			"ws",
			`${mismatch}; allowed by sessions.linkVersionCheck=${mode}`,
		);
	return failed(
		"ws",
		mismatch,
		`this node heals an older peer via its /api/self-update on connect; if the heal latched, run \`assist update\` on the older node, then \`assist daemon restart\` here`,
	);
}
