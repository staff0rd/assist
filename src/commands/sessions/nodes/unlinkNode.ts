import chalk from "chalk";
import { readLinks, writeLinks } from "./writeLinks";

export async function unlinkNode(name: string): Promise<void> {
	const links = readLinks();
	const remaining = links.filter((link) => link.name !== name);
	if (remaining.length === links.length) {
		console.log(chalk.yellow(`No link named ${name}`));
		return;
	}
	await writeLinks(remaining);
	console.log(chalk.green(`Unlinked ${name}`));
}
