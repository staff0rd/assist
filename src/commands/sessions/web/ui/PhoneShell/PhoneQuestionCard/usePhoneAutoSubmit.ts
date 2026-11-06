import type { AskQuestion } from "../../../../shared/askQuestionInputSchema";
import { autoSubmitAnswers } from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/autoSubmitAnswers";
import { useAskQuestionAutoSubmit } from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/useAskQuestionAutoSubmit";
import type { QuestionChoice } from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/QuestionChoice";

export function usePhoneAutoSubmit({
	cwd,
	questions,
	choices,
	onSubmit,
	onAdvance,
}: {
	cwd: string | undefined;
	questions: AskQuestion[];
	choices: QuestionChoice[];
	onSubmit: (answers: Record<string, string>) => void;
	onAdvance: (index: number) => void;
}) {
	const [checked, onChange] = useAskQuestionAutoSubmit(cwd);

	const afterPick = (index: number, label: string) => {
		if (!checked || questions.some((q) => q.multiSelect)) return;
		const answers = autoSubmitAnswers(questions, choices, index, label);
		if (answers) onSubmit(answers);
		else onAdvance(index);
	};

	return { toggle: { checked, onChange }, afterPick };
}
