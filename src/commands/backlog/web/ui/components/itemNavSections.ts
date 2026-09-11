import type { BacklogItem, PhaseStatus } from "../types";
import { ITEM_SECTION_IDS, phaseAnchor } from "./itemSectionAnchor";
import { phaseStatus, REVIEW_PHASE } from "./sessionsByPhase";

export type ItemNavSection = {
	id: string;
	label: string;
	title?: string;
	status?: PhaseStatus;
	nested?: boolean;
};

function planSections(item: BacklogItem): ItemNavSection[] {
	const phases = item.plan ?? [];
	if (phases.length === 0) return [];
	const hasReview = (item.phaseSessions ?? []).some(
		(s) => s.phaseIdx >= phases.length,
	);
	const allPhases = hasReview ? [...phases, REVIEW_PHASE] : phases;
	return [
		{ id: ITEM_SECTION_IDS.plan, label: "Phases" },
		...allPhases.map((phase, i) => ({
			id: phaseAnchor(i).id,
			label: `${i + 1}`,
			title: phase.name,
			status: phaseStatus(i, item.currentPhase),
			nested: true,
		})),
	];
}

export function itemNavSections(item: BacklogItem): ItemNavSection[] {
	const sections: ItemNavSection[] = [];
	if (item.description)
		sections.push({ id: ITEM_SECTION_IDS.description, label: "Description" });
	if (item.acceptanceCriteria.length > 0)
		sections.push({
			id: ITEM_SECTION_IDS.acceptanceCriteria,
			label: "Acceptance Criteria",
		});
	if ((item.subtasks?.length ?? 0) > 0)
		sections.push({ id: ITEM_SECTION_IDS.subtasks, label: "Sub-tasks" });
	sections.push(...planSections(item));
	if ((item.gitRefs?.length ?? 0) + (item.conversations?.length ?? 0) > 0)
		sections.push({ id: ITEM_SECTION_IDS.activity, label: "Activity" });
	if ((item.comments?.length ?? 0) > 0)
		sections.push({ id: ITEM_SECTION_IDS.comments, label: "Comments" });
	return sections;
}
