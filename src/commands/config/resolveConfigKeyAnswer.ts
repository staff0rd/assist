import chalk from "chalk";
import { promptInput } from "../../shared/promptInput";
import type { ConfigWritableValue } from "./applyConfigSet";
import { coerceCliConfigValue } from "./coerceCliConfigValue";
import { exitWithConfigErrors } from "./exitWithConfigErrors";

export type ConfigKeyQuestion = {
	key: string;
	question: string;
	suggest?: string;
};

export async function resolveConfigKeyAnswer(
	question: ConfigKeyQuestion,
	supplied: string | undefined,
): Promise<ConfigWritableValue | undefined> {
	if (supplied !== undefined) return coerceSupplied(question.key, supplied);
	for (;;) {
		const answer = (
			await promptInput(question.key, question.question, question.suggest)
		).trim();
		if (answer === "") return undefined;
		const coercion = coerceCliConfigValue(question.key, answer);
		if (coercion.ok) return coercion.value;
		console.error(chalk.red(coercion.error));
	}
}

function coerceSupplied(
	key: string,
	supplied: string,
): ConfigWritableValue | undefined {
	if (supplied.trim() === "") return undefined;
	const coercion = coerceCliConfigValue(key, supplied.trim());
	if (!coercion.ok) exitWithConfigErrors([coercion.error]);
	return coercion.value;
}
