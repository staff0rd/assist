import { addSubIssue } from "./addSubIssue";
import { failParentChange } from "./failParentChange";
import type { EditIssueParent } from "./resolveEditIssueParent";

export function applyEditIssueParent(change: EditIssueParent): void {
	try {
		addSubIssue(change.parent.id, change.childId);
	} catch (error) {
		failParentChange(change.child, error);
	}
	console.log(`${change.child} is now a sub-issue of ${change.label}`);
}
