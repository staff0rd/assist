import { renderPhaseSection } from "../renderPhaseSection";
import type { ProposedItem } from "./proposedItemSchema";

export function renderProposedItem(item: ProposedItem): string {
	const sections = [`**Type:** ${item.type}`];

	if (item.summary) sections.push(`**Why:** ${item.summary}`);

	if (item.description) sections.push("## Description", item.description);

	if (item.acceptanceCriteria.length > 0)
		sections.push(
			"## Acceptance Criteria",
			item.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join("\n"),
		);

	if (item.phases.length > 0)
		sections.push("## Plan", ...item.phases.map(renderPhaseSection));

	return sections.join("\n\n");
}
