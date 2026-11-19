import type { AskQuestion } from "../shared/askQuestionInputSchema";

function questionIndex(questions: AskQuestion[], key: string): number {
	const k = key.trim().toLowerCase();
	const n = Number.parseInt(k, 10);
	if (String(n) === k && n >= 1 && n <= questions.length) return n - 1;
	return questions.findIndex(
		(q) => q.header.toLowerCase() === k || q.question.toLowerCase() === k,
	);
}

function splitAnswer(
	questions: AskQuestion[],
	answer: string,
): [number, string] {
	const eq = answer.indexOf("=");
	const index = eq > 0 ? questionIndex(questions, answer.slice(0, eq)) : -1;
	if (index >= 0) return [index, answer.slice(eq + 1).trim()];
	if (questions.length === 1) return [0, answer.trim()];
	throw new Error(
		`Answer "${answer}" names no question; use <number|header>=<choice>`,
	);
}

function canonicalChoice(question: AskQuestion, choice: string): string {
	const option = question.options.find(
		(o) => o.label.toLowerCase() === choice.toLowerCase(),
	);
	return option?.label ?? choice;
}

export function parseAnswers(
	questions: AskQuestion[],
	answers: string[],
): Record<string, string> {
	const chosen = questions.map((): string[] => []);
	for (const answer of answers) {
		const [index, choice] = splitAnswer(questions, answer);
		if (choice) chosen[index].push(canonicalChoice(questions[index], choice));
	}
	const result: Record<string, string> = {};
	questions.forEach((q, i) => {
		if (chosen[i].length === 0)
			throw new Error(`No answer for question ${i + 1}: ${q.question}`);
		if (!q.multiSelect && chosen[i].length > 1)
			throw new Error(`Question ${i + 1} takes one answer: ${q.question}`);
		result[q.question] = chosen[i].join(", ");
	});
	return result;
}
