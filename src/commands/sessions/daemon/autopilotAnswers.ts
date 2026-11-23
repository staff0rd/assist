import { parseQuestions } from "../shared/parseQuestions";
import { findRecommendedOption } from "./findRecommendedOption";

export function autopilotAnswers(
	body: string,
): Record<string, string> | undefined {
	const questions = parseQuestions(body);
	if (!questions) return undefined;
	return Object.fromEntries(
		questions.map(({ question, options }) => {
			const option = findRecommendedOption(options) ?? options[0];
			return [question, option?.label ?? ""];
		}),
	);
}
