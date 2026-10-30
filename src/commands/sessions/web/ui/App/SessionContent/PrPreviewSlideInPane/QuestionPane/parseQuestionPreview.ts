import type {
	AskQuestion,
	AskQuestionInput,
} from "../../../../../../shared/askQuestionInputSchema";

function isQuestion(question: AskQuestion): boolean {
	return (
		typeof question?.question === "string" &&
		typeof question.header === "string" &&
		Array.isArray(question.options) &&
		question.options.every((option) => typeof option?.label === "string")
	);
}

export function parseQuestionPreview(body: string): AskQuestion[] {
	try {
		const parsed = JSON.parse(body) as AskQuestionInput;
		return Array.isArray(parsed?.questions)
			? parsed.questions.filter(isQuestion)
			: [];
	} catch {
		return [];
	}
}
