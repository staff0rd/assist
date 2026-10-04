import { findLinkSpec } from "../shared/loadLinkSpecs";
import { buildDoctorProbes } from "./buildDoctorProbes";
import { diagnoseLink } from "./diagnoseLink";
import type { Hop } from "./DoctorProbes";
import { queryNodes } from "./queryNodes";

export async function firstBrokenHop(name: string): Promise<Hop | undefined> {
	const spec = findLinkSpec(name);
	if (!spec)
		return {
			hop: "link",
			ok: false,
			error: `no link named ${name}`,
			remediation: "see `assist sessions nodes`",
		};
	const diagnosis = await diagnoseLink(
		spec,
		buildDoctorProbes(await queryNodes()),
	);
	return diagnosis.hops.find((hop) => !hop.ok);
}
