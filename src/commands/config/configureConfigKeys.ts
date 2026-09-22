import type { ConfigKeyWrite } from "./ConfigKeyWrite";
import { exitWithConfigErrors } from "./exitWithConfigErrors";
import { promptConfigScope } from "./promptConfigScope";
import {
	type ConfigKeyQuestion,
	resolveConfigKeyAnswer,
} from "./resolveConfigKeyAnswer";
import { type ConfigKeyScope, writeConfigKeys } from "./writeConfigKeys";

type ConfigureConfigKeysOptions = {
	answers?: Record<string, string>;
	scope?: ConfigKeyScope;
	cwd?: string;
};

export type ConfigureConfigKeysResult = {
	scope: ConfigKeyScope;
	target: string;
	written: ConfigKeyWrite[];
	skipped: string[];
};

export async function configureConfigKeys(
	questions: ConfigKeyQuestion[],
	options: ConfigureConfigKeysOptions = {},
): Promise<ConfigureConfigKeysResult> {
	const scope = options.scope ?? (await promptConfigScope());
	const written: ConfigKeyWrite[] = [];
	const skipped: string[] = [];
	for (const question of questions) {
		const value = await resolveConfigKeyAnswer(
			question,
			options.answers?.[question.key],
		);
		if (value === undefined) skipped.push(question.key);
		else written.push({ key: question.key, value });
	}
	const result = writeConfigKeys(written, scope, options.cwd);
	if (!result.ok) exitWithConfigErrors(result.errors);
	return { scope, target: result.target, written, skipped };
}
