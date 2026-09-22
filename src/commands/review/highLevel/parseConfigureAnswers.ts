import chalk from "chalk";
import { highLevelConfigKeys } from "./highLevelConfigKeys";

export function parseConfigureAnswers(
	answers: string[],
): Record<string, string> {
	const known = Object.values(highLevelConfigKeys) as string[];
	const parsed: Record<string, string> = {};
	for (const answer of answers) {
		const separator = answer.indexOf("=");
		if (separator <= 0) exitWith(`--answer expects key=value, got '${answer}'`);
		const key = answer.slice(0, separator).trim();
		if (!known.includes(key))
			exitWith(`--answer key '${key}' is not one of ${known.join(", ")}`);
		parsed[key] = answer.slice(separator + 1);
	}
	return parsed;
}

export function answersCoverEveryKey(answers: Record<string, string>): boolean {
	return Object.values(highLevelConfigKeys).every((key) => key in answers);
}

function exitWith(message: string): never {
	console.error(chalk.red(`Error: ${message}.`));
	process.exit(1);
}
