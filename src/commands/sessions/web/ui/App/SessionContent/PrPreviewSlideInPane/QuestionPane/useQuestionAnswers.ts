import { useState } from "react";
import type { AskQuestion } from "../../../../../../shared/askQuestionInputSchema";
import type { QuestionChoice } from "./QuestionChoice";
import { questionAnswerText } from "./questionAnswerText";

const empty: QuestionChoice = { labels: [], otherOn: false, otherText: "" };

export function useQuestionAnswers(questions: AskQuestion[]) {
	const [choices, setChoices] = useState<QuestionChoice[]>(() =>
		questions.map(() => empty),
	);

	const update = (
		index: number,
		change: (choice: QuestionChoice) => QuestionChoice,
	) =>
		setChoices((prev) =>
			prev.map((choice, i) => (i === index ? change(choice) : choice)),
		);

	const pick = (index: number, label: string) =>
		update(index, (choice) => {
			if (!questions[index]?.multiSelect)
				return { ...choice, labels: [label], otherOn: false };
			const labels = choice.labels.includes(label)
				? choice.labels.filter((l) => l !== label)
				: [...choice.labels, label];
			return { ...choice, labels };
		});

	const pickOther = (index: number) =>
		update(index, (choice) =>
			questions[index]?.multiSelect
				? { ...choice, otherOn: !choice.otherOn }
				: { ...choice, labels: [], otherOn: true },
		);

	const setOtherText = (index: number, otherText: string) =>
		update(index, (choice) => ({ ...choice, otherText }));

	const answers = Object.fromEntries(
		questions.map((question, i) => [
			question.question,
			questionAnswerText(question, choices[i] ?? empty),
		]),
	);
	const answered = Object.values(answers).filter(Boolean).length;

	return { choices, pick, pickOther, setOtherText, answers, answered };
}
