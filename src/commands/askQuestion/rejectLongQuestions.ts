import type { AskQuestion } from "../sessions/shared/askQuestionInputSchema";

const MAX_WORDS = { question: 30, context: 40 } as const;

type CappedField = keyof typeof MAX_WORDS;

function countWords(text: string): number {
	return text.split(/\s+/).filter(Boolean).length;
}

function violations(q: AskQuestion) {
	return (Object.keys(MAX_WORDS) as CappedField[])
		.map((field) => ({
			header: q.header,
			field,
			words: countWords(q[field] ?? ""),
		}))
		.filter((v) => v.words > MAX_WORDS[v.field]);
}

export function rejectLongQuestions(questions: AskQuestion[]): void {
	const tooLong = questions.flatMap(violations);
	if (tooLong.length === 0) return;
	console.error(
		[
			`Error: each question must be ${MAX_WORDS.question} words or fewer and its context ${MAX_WORDS.context} words or fewer:`,
			...tooLong.map((v) => `- ${v.header} ${v.field}: ${v.words} words`),
			"Shorten these and re-run assist ask-question.",
		].join("\n"),
	);
	process.exit(1);
}
