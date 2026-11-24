import { addSubIssue } from "./addSubIssue";
import { failEditIssueChange } from "./failEditIssueChange";
import { updateIssueType } from "./fixStructure/updateIssueType";
import type { EditIssueMetadata } from "./resolveEditIssueMetadata";

export function applyEditIssueMetadata(metadata: EditIssueMetadata): void {
	const { child, childId, issueType, parent } = metadata;
	if (issueType) {
		try {
			updateIssueType(childId, issueType.id);
		} catch (error) {
			failEditIssueChange(`the issue type of ${child}`, error);
		}
		console.log(`${child} is now a ${issueType.name}`);
	}
	if (parent) {
		try {
			addSubIssue(parent.id, childId);
		} catch (error) {
			failEditIssueChange(`the parent of ${child}`, error);
		}
		console.log(`${child} is now a sub-issue of ${parent.label}`);
	}
}
