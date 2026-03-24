import { loadConfig } from "../../shared/loadConfig";
import { deadCodeRules } from "./deadCodeRules";
import type { Issue } from "./parseInspectReport";

export function filterIssues(issues: Issue[], all: boolean): Issue[] {
	const suppress = new Set(loadConfig().dotnet?.inspect.suppress ?? []);
	return issues.filter(
		(i) => (all || deadCodeRules.has(i.typeId)) && !suppress.has(i.typeId),
	);
}
