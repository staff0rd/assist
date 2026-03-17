import { execSync } from "node:child_process";
import chalk from "chalk";

type OpItem = { id: string; title: string; vault: { name: string } };
type OpField = { id: string; label: string; reference: string; value?: string };

function opExec(args: string): string {
	return execSync(`op ${args}`, {
		encoding: "utf-8",
		stdio: ["pipe", "pipe", "pipe"],
	}).trim();
}

export function searchItems(search: string): OpItem[] {
	let items: OpItem[];
	try {
		items = JSON.parse(opExec("item list --format=json"));
	} catch {
		console.error(
			chalk.red(
				"Failed to search 1Password. Ensure the CLI is installed and you are signed in.",
			),
		);
		process.exit(1);
	}

	const lower = search.toLowerCase();
	return items.filter((i) => i.title.toLowerCase().includes(lower));
}

export function getItemFields(itemId: string): OpField[] {
	try {
		const item = JSON.parse(opExec(`item get "${itemId}" --format=json`));
		return (item.fields as OpField[]).filter((f) => f.reference && f.label);
	} catch {
		console.error(chalk.red("Failed to get item details from 1Password."));
		process.exit(1);
	}
}
