import { askQuestionInputSchema } from "../shared/askQuestionInputSchema";

const RECOMMENDED = "(Recommended)";

function parseQuestions(body: string) {
	try {
		const parsed = askQuestionInputSchema.safeParse(JSON.parse(body));
		return parsed.success ? parsed.data.questions : undefined;
	} catch {
		return undefined;
	}
}

export function recommendedAnswers(
	body: string,
): Record<string, string> | undefined {
	const questions = parseQuestions(body);
	if (!questions) return undefined;
	const answers: Record<string, string> = {};
	for (const question of questions) {
		if (question.multiSelect) return undefined;
		const option = question.options.find((o) =>
			o.label.trim().endsWith(RECOMMENDED),
		);
		if (!option) return undefined;
		answers[question.question] = option.label;
	}
	return answers;
}
