import type { Leftover } from "../daemon/worktree/Leftover";
import { cleanLeftoversEnabled } from "../daemon/worktree/cleanLeftoversEnabled";
import { listLeftovers } from "../daemon/worktree/listLeftovers";
import { loadLinkSpecs } from "../shared/loadLinkSpecs";
import { resolveNodeName } from "../shared/resolveNodeName";
import { diagnoseLink } from "./diagnoseLink";
import type { LinkDiagnosis } from "./DoctorProbes";
import {
	findUnlinkedWindowsNode,
	type LinkSuggestion,
} from "./findUnlinkedWindowsNode";
import { queryNodes } from "./queryNodes";
import { printReport } from "./printReport";
import { buildDoctorProbes } from "./buildDoctorProbes";
import { printLeftovers } from "./printLeftovers";

type DoctorReport = {
	local: string;
	links: LinkDiagnosis[];
	suggestion?: LinkSuggestion;
	leftovers: Leftover[];
};

export async function doctorNodes(
	name: string | undefined,
	options: { json?: boolean },
): Promise<void> {
	const specs = loadLinkSpecs().filter((spec) => !name || spec.name === name);
	if (name && specs.length === 0)
		throw new Error(`No link named ${name}; see assist sessions nodes`);
	const probes = buildDoctorProbes(await queryNodes());
	const report: DoctorReport = {
		local: resolveNodeName(),
		links: [],
		leftovers: cleanLeftoversEnabled() ? listLeftovers() : [],
	};
	for (const spec of specs) report.links.push(await diagnoseLink(spec, probes));
	if (specs.length === 0)
		report.suggestion = await findUnlinkedWindowsNode(probes.health);
	if (report.links.some((l) => !l.ok)) process.exitCode = 1;
	if (options.json) console.log(JSON.stringify(report, null, 2));
	else {
		printReport(report);
		printLeftovers(report.leftovers);
	}
}
