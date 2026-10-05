import {
	describeProtocolGap,
	isHello,
	negotiateProtocol,
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
	const protocol = negotiateProtocol(msg);
	if (protocol !== undefined)
		return passed("ws", `hello ${msg.version} (protocol ${protocol})`);
	const gap = describeProtocolGap(spec.name, msg);
	const mode = linkVersionCheck();
	if (mode !== "block")
		return passed("ws", `${gap}; allowed by sessions.linkVersionCheck=${mode}`);
	return failed(
		"ws",
		gap,
		`run \`assist update\` on the older node, then restart its daemon (\`assist daemon restart\`) when convenient`,
	);
}
