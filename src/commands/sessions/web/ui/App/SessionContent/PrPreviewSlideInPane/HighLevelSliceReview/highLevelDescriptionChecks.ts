import type { HighLevelCheckId } from "../../../../../../../review/highLevel/highLevelChecklist";
import type { HighLevelCheckResult } from "../../../../../../../review/highLevel/types";

export const DESCRIPTION_CHECK_LABELS: Partial<
	Record<HighLevelCheckId, string>
> = {
	"description-what-why": "What & Why",
	"description-word-cap": "Word cap",
	"description-links-issue": "Linked issue",
};

export function highLevelDescriptionChecks(
	checks: HighLevelCheckResult[],
): HighLevelCheckResult[] {
	return checks.filter((check) => check.id in DESCRIPTION_CHECK_LABELS);
}
