import { checkDescriptionLinksIssue } from "./checkDescriptionLinksIssue";
import { checkDescriptionSections } from "./checkDescriptionSections";
import { checkDescriptionWordCap } from "./checkDescriptionWordCap";
import { checkUiEvidence } from "./checkUiEvidence";
import {
	type DeterministicCheckId,
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
		checkDescriptionLinksIssue(subject.body),
	"ui-evidence": (subject) =>
		checkUiEvidence(subject.body, subject.changedFiles, subject.config.uiPaths),
};

export function evaluateHighLevelChecks(
	subject: HighLevelSubject,
): HighLevelCheckResult[] {
	return highLevelChecklist.map((check) => {
		if (check.kind === "manual")
			return { ...check, status: "manual", reason: check.backing };
		return { ...check, ...evaluators[check.id](subject) };
	});
}
