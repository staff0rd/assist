import {
	type AskQuestion,
	askQuestionInputSchema,
} from "../../shared/askQuestionInputSchema";

function parseQuestions(body: string): AskQuestion[] {
	try {
		const parsed = askQuestionInputSchema.safeParse(JSON.parse(body));
		return parsed.success ? parsed.data.questions : [];
	} catch {
		return [];
	}
}

// why: the pane joins picked labels (in option order) and the Other text with
// ", ", so the free text is whatever follows the leading labels
function otherOf(question: AskQuestion, answer: string): string {
	let rest = answer;
	for (const { label } of question.options) {
		if (rest === label) return "";
		if (rest.startsWith(`${label}, `)) rest = rest.slice(label.length + 2);
	}
	return rest.trim();
}

export function questionOtherText(
	body: string,
	answers: Record<string, string>,
): string {
	const questions = parseQuestions(body);
	const others = questions.flatMap((question) => {
		const answer = answers[question.question];
		const text = typeof answer === "string" ? otherOf(question, answer) : "";
		return text ? [{ header: question.header, text }] : [];
	});
	if (others.length === 1) return others[0].text;
	return others.map(({ header, text }) => `${header}: ${text}`).join("\n\n");
}
