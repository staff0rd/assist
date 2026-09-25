import chalk from "chalk";
import { isClaudeCode } from "../../lib/isClaudeCode";
import { createItemWithDefaults } from "./createItemWithDefaults";
import { ensureRemoteOrigin } from "./ensureRemoteOrigin";
import { formatItemId } from "./formatItemId";
import type { BacklogType } from "./types";
import {
	promptAcceptanceCriteria,
	promptDescription,
	promptName,
	promptType,
} from "./add/shared";

type AddOptions = {
	name?: string;
	type?: string;
	desc?: string;
	ac?: string[];
};

export async function add(options: AddOptions): Promise<void> {
	if (isClaudeCode()) {
		console.error(
			chalk.red(
				"Error: 'assist backlog add' is for human use. Compose the whole item — name, type, description, acceptance criteria and every phase — and run 'assist backlog propose --json <file|->' so it is previewed and approved before anything is written.",
			),
		);
		process.exitCode = 1;
		return;
	}

	if (!ensureRemoteOrigin()) return;

	const type = (options.type as BacklogType) ?? (await promptType());
	const name = options.name ?? (await promptName());
	const description =
		options.desc?.replaceAll(String.raw`\n`, "\n") ??
		(await promptDescription());
	const acceptanceCriteria = options.ac ?? (await promptAcceptanceCriteria());

	const id = await createItemWithDefaults({
		type,
		name,
		description,
		acceptanceCriteria,
	});

	console.log(chalk.green(`Added item ${formatItemId(id)}: ${name}`));
}
