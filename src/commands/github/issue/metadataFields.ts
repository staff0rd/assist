import type { IssueMetadataField } from "./fetchIssue";
import type { EditIssueMetadata } from "./resolveEditIssueMetadata";

export function metadataFields(
	metadata: EditIssueMetadata | undefined,
): IssueMetadataField[] {
	const fields: IssueMetadataField[] = [];
	if (metadata?.parent) fields.push("parent");
	if (metadata?.issueType) fields.push("issueType");
	return fields;
}
