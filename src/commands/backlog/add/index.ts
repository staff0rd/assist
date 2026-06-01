import chalk from "chalk";
import { getBacklogDb } from "../getBacklogDb";
import { insertItem } from "../insertItem";
import { getOrigin } from "../shared";
import type { BacklogType } from "../types";
import {
	promptAcceptanceCriteria,
	promptDescription,
	promptName,
	promptType,
} from "./shared";

type AddOptions = {
	name?: string;
	type?: string;
	desc?: string;
	ac?: string[];
};

export async function add(options: AddOptions): Promise<void> {
	const type = (options.type as BacklogType) ?? (await promptType());
	const name = options.name ?? (await promptName());
	const description =
		options.desc?.replaceAll("\\n", "\n") ?? (await promptDescription());
	const acceptanceCriteria = options.ac ?? (await promptAcceptanceCriteria());

	const db = await getBacklogDb();
	const id = await insertItem(
		db,
		{
			type,
			name,
			description: description || undefined,
			acceptanceCriteria,
			status: "todo",
		},
		getOrigin(),
	);
	console.log(chalk.green(`Added item #${id}: ${name}`));
}
