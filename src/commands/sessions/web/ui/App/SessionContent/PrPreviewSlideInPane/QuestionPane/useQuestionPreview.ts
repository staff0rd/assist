import { useMemo } from "react";
import type { PrPreview } from "../../../../../../shared/SessionInfoBase";
import type { PrDecisionDetails } from "../../../../PrDecisionDetails";
import { parseQuestionPreview } from "./parseQuestionPreview";
import { useQuestionAnswers } from "./useQuestionAnswers";

export type QuestionDecision = (
	decision: "approve" | "reject",
	details: PrDecisionDetails,
) => void;

export function useQuestionPreview(preview: PrPreview) {
	const questions = useMemo(
		() => parseQuestionPreview(preview.body),
		[preview.body],
	);
	return { questions, state: useQuestionAnswers(questions) };
}
