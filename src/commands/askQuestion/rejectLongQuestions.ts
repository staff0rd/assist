import type { AskQuestion } from "../sessions/shared/askQuestionInputSchema";

const MAX_QUESTION_WORDS = 30;

function countWords(text: string): number {
	return text.split(/\s+/).filter(Boolean).length;
}

export function rejectLongQuestions(questions: AskQuestion[]): void {
	const longQuestions = questions
		.map((q) => ({ header: q.header, words: countWords(q.question) }))
		.filter((q) => q.words > MAX_QUESTION_WORDS);
	if (longQuestions.length === 0) return;
	console.error(
		[
			`Error: questions must be ${MAX_QUESTION_WORDS} words or fewer:`,
			...longQuestions.map((q) => `- ${q.header}: ${q.words} words`),
			"Shorten these questions and re-run assist ask-question.",
		].join("\n"),
	);
	process.exit(1);
}
