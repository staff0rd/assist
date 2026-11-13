import { attachCriteriaToggle } from "./attachCriteriaToggle";
import { criteriaEditorScope } from "./criteriaEditorScope";
import { isIssueBodyTextarea } from "./isIssueBodyTextarea";

export function attachCriteriaEditors(): void {
	const scope = criteriaEditorScope(globalThis.location);
	if (!scope) return;
	for (const textarea of scope.querySelectorAll("textarea")) {
		if (isIssueBodyTextarea(textarea)) attachCriteriaToggle(textarea);
	}
}
