import { loadConfig } from "../../shared/loadConfig";
import { deadCodeRules } from "./deadCodeRules";
import type { Issue } from "./parseInspectReport";

export function filterIssues(
	issues: Issue[],
	all: boolean,
	cliOnly: string[],
	cliSuppress: string[],
): Issue[] {
	const only = cliOnly.length > 0 ? new Set(cliOnly) : null;
	const suppress = new Set([
		...(loadConfig().dotnet?.inspect.suppress ?? []),
		...cliSuppress,
	]);
	return issues.filter(
		(i) =>
			(only ? only.has(i.typeId) : all || deadCodeRules.has(i.typeId)) &&
			!suppress.has(i.typeId),
	);
}
