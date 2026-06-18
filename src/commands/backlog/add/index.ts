import chalk from "chalk";
import { getDb } from "../../../shared/db/getDb";
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
		options.desc?.replaceAll(String.raw`\n`, "\n") ??
		(await promptDescription());
	const acceptanceCriteria = options.ac ?? (await promptAcceptanceCriteria());

	const orm = await getDb();
	const id = await insertItem(
		orm,
		{
			type,
			name,
			description: description || undefined,
			acceptanceCriteria,
			status: "todo",
			starred: false,
		},
		getOrigin(),
	);
	console.log(chalk.green(`Added item #${id}: ${name}`));
}
