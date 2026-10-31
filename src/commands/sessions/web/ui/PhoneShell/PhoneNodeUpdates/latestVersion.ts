import type { NodeUpdateEntry } from "../../App/AppShell/NodeUpdateEntry";
import { compareVersions } from "../PhoneNodesSheet/compareVersions";

export function latestVersion(entries: NodeUpdateEntry[]): string | undefined {
	const versions = entries.flatMap(({ status }) =>
		status ? [status.running, status.built] : [],
	);
	return versions.reduce<string | undefined>(
		(max, v) => (!max || compareVersions(v, max) > 0 ? v : max),
		undefined,
	);
}
