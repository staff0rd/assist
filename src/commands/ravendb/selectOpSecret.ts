import chalk from "chalk";
import Enquirer from "enquirer";
import { getItemFields, searchItems } from "./searchItems";

const { Input, Select } = Enquirer as unknown as {
	Input: new (opts: {
		name: string;
		message: string;
	}) => {
		run: () => Promise<string>;
	};
	Select: new (opts: {
		name: string;
		message: string;
		choices: { name: string; value: string }[];
	}) => { run: () => Promise<string> };
};

async function selectOne(
	message: string,
	choices: { name: string; value: string }[],
): Promise<string> {
	if (choices.length === 1) return choices[0].value;
	const selected = await new Select({ name: "choice", message, choices }).run();
	return choices.find((c) => c.name === selected)?.value ?? selected;
}

export async function selectOpSecret(searchTerm?: string): Promise<string> {
	const search =
		searchTerm ??
		(await new Input({
			name: "search",
			message: "Search 1Password for API key item:",
		}).run());

	const items = searchItems(search);
	if (items.length === 0) {
		console.error(chalk.red(`No items found matching "${search}".`));
		process.exit(1);
	}

	const itemId = await selectOne(
		"Select item:",
		items.map((i) => ({ name: `${i.title} (${i.vault.name})`, value: i.id })),
	);

	const fields = getItemFields(itemId);
	if (fields.length === 0) {
		console.error(chalk.red("No fields with references found on this item."));
		process.exit(1);
	}

	const ref = await selectOne(
		"Select field:",
		fields.map((f) => ({ name: f.label, value: f.reference })),
	);

	return ref;
}
