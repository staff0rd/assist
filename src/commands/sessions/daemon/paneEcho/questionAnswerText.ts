import { askQuestionInputSchema } from "../../shared/askQuestionInputSchema";

function questionOrder(body: string): string[] {
	try {
		const parsed = askQuestionInputSchema.safeParse(JSON.parse(body));
		return parsed.success ? parsed.data.questions.map((q) => q.question) : [];
	} catch {
		return [];
	}
}

export function questionAnswerText(
	body: string,
	answers: Record<string, string>,
): string {
	const order = questionOrder(body);
	const keys = [
		...order.filter((question) => question in answers),
		...Object.keys(answers).filter((question) => !order.includes(question)),
	];
	return keys
		.map((question) => answers[question].trim())
		.filter(Boolean)
		.join("\n\n");
}
