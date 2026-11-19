import {
	type AskQuestion,
	askQuestionInputSchema,
} from "./askQuestionInputSchema";

export function parseQuestions(body: string): AskQuestion[] | undefined {
	try {
		const parsed = askQuestionInputSchema.safeParse(JSON.parse(body));
		return parsed.success ? parsed.data.questions : undefined;
	} catch {
		return undefined;
	}
}
