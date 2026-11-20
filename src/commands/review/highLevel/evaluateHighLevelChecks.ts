import { checkDescriptionLinksIssue } from "./checkDescriptionLinksIssue";
import { checkDescriptionSections } from "./checkDescriptionSections";
import { checkDescriptionWordCap } from "./checkDescriptionWordCap";
import { checkNoMergeConflicts } from "./checkNoMergeConflicts";
import { checkUiEvidence } from "./checkUiEvidence";
import {
	type DeterministicCheckId,
	type HighLevelCheckId,
	highLevelChecklist,
} from "./highLevelChecklist";
import type {
	CheckOutcome,
	HighLevelCheckResult,
	HighLevelSubject,
} from "./types";

const evaluators: Record<
	DeterministicCheckId,
	(subject: HighLevelSubject) => CheckOutcome
> = {
	"description-what-why": (subject) => checkDescriptionSections(subject.body),
	"description-word-cap": (subject) =>
		checkDescriptionWordCap(subject.body, subject.config.descriptionWordCap),
	"description-links-issue": (subject) =>
		checkDescriptionLinksIssue(subject.body, subject.linkedIssues),
	"ui-evidence": (subject) =>
		checkUiEvidence(subject.body, subject.changedFiles, subject.config.uiPaths),
	"no-merge-conflicts": (subject) =>
		checkNoMergeConflicts(subject.mergeable, subject.baseRef),
};

export function evaluateHighLevelChecks(
	subject: HighLevelSubject,
): HighLevelCheckResult[] {
	const omitted = new Set<HighLevelCheckId>();
	if (!subject.sliced) omitted.add("manual-testing");
	if (!subject.config.requireLinkedIssue)
		omitted.add("description-links-issue");
	const checks = highLevelChecklist.filter((check) => !omitted.has(check.id));
	return checks.map((check) => {
		if (check.kind === "manual")
			return { ...check, status: "manual", reason: check.backing };
		return { ...check, ...evaluators[check.id](subject) };
	});
}
