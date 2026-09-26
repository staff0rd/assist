import type { NodesMessage } from "../daemon/links/LinkStatus";
import { loadLinkSpecs } from "../shared/loadLinkSpecs";
import { resolveNodeName } from "../shared/resolveNodeName";
import { diagnoseLink } from "./diagnoseLink";
import type { DoctorProbes, LinkDiagnosis } from "./DoctorProbes";
import { fetchPeerJson } from "./fetchPeerJson";
import {
	findUnlinkedWindowsNode,
	type LinkSuggestion,
} from "./findUnlinkedWindowsNode";
import { portAccepts } from "../shared/portAccepts";
import { probePeerHello } from "./probePeerHello";
import { probeSsh } from "./probeSsh";
import { probeSshAgent } from "./probeSshAgent";
import { queryNodes } from "./queryNodes";
import { printReport } from "./printReport";

type DoctorReport = {
	local: string;
	links: LinkDiagnosis[];
	suggestion?: LinkSuggestion;
};

function doctorProbes(live: NodesMessage | undefined): DoctorProbes {
	return {
		health: (url) => fetchPeerJson(url, "/api/health"),
		hello: probePeerHello,
		sshAgent: probeSshAgent,
		ssh: probeSsh,
		tunnel: (localPort) => portAccepts(localPort),
		linkState: (name) => {
			if (!live) return "no-daemon";
			return live.links.find((l) => l.name === name) ?? "unknown-link";
		},
	};
}

export async function doctorNodes(
	name: string | undefined,
	options: { json?: boolean },
): Promise<void> {
	const specs = loadLinkSpecs().filter((spec) => !name || spec.name === name);
	if (name && specs.length === 0)
		throw new Error(`No link named ${name}; see assist sessions nodes`);
	const probes = doctorProbes(await queryNodes());
	const report: DoctorReport = { local: resolveNodeName(), links: [] };
	for (const spec of specs) report.links.push(await diagnoseLink(spec, probes));
	if (specs.length === 0)
		report.suggestion = await findUnlinkedWindowsNode(probes.health);
	if (report.links.some((l) => !l.ok)) process.exitCode = 1;
	if (options.json) console.log(JSON.stringify(report, null, 2));
	else printReport(report);
}
