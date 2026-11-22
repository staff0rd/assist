import { parseQuestions } from "../shared/parseQuestions";

const RECOMMENDED = "(Recommended)";

export function autopilotAnswers(
	body: string,
): Record<string, string> | undefined {
	const questions = parseQuestions(body);
	if (!questions) return undefined;
	return Object.fromEntries(
		questions.map(({ question, options }) => {
			const option =
				options.find((o) => o.label.trim().endsWith(RECOMMENDED)) ?? options[0];
			return [question, option?.label ?? ""];
		}),
	);
}
