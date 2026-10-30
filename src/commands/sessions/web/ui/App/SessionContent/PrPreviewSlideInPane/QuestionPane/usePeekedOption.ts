import { useState } from "react";
import type { AskQuestion } from "../../../../../../shared/askQuestionInputSchema";

export function usePeekedOption(question: AskQuestion, selected: string[]) {
	const [peek, setPeek] = useState<string | null>(null);
	const withPreview = question.options.filter((option) => option.preview);
	const peeked =
		withPreview.find((option) => option.label === peek) ??
		withPreview.find((option) => selected.includes(option.label)) ??
		withPreview[0];
	return { peeked, setPeek };
}
