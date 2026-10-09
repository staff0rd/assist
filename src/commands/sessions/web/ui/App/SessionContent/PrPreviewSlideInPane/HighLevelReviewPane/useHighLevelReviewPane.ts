import { useMemo } from "react";
import type { PrPreview } from "../../../../../../shared/SessionInfoBase";
import type { SessionInfo } from "../../../../types";
import { highLevelCheckDetails } from "./useHighLevelReviewPane/highLevelCheckDetails";
import { parseHighLevelPreview } from "./useHighLevelReviewPane/parseHighLevelPreview";
import { useHighLevelChecklist } from "./useHighLevelChecklist";
import { useHighLevelDiffComments } from "./useHighLevelReviewPane/useHighLevelDiffComments";

const TESTS_ITEM = "tests-worth-having";

export function useHighLevelReviewPane(
	preview: PrPreview,
	session: SessionInfo | undefined,
	sendInput: ((sessionId: string, data: string) => void) | undefined,
) {
	const payload = useMemo(
		() => parseHighLevelPreview(preview.body),
		[preview.body],
	);
	const checklist = useHighLevelChecklist(payload.checks, payload.saved);
	const { comments, sentTo, clearSent } = useHighLevelDiffComments(
		session,
		sendInput,
	);
	const details = highLevelCheckDetails(
		payload,
		{
			note: (testId) => checklist.note(TESTS_ITEM, testId),
			onNote: (testId, note) => checklist.onNote(TESTS_ITEM, testId, note),
		},
		comments,
	);

	return { payload, checklist, details, sentTo, clearSent };
}
