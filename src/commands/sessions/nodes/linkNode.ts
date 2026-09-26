import chalk from "chalk";
import { resolveNodeName } from "../shared/resolveNodeName";
import { readLinks, writeLinks } from "./writeLinks";

function parseLinkUrl(url: string): string {
	const parsed = new URL(url);
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
		throw new Error(`link url must be http(s): ${url}`);
	return parsed.origin;
}

export async function linkNode(name: string, url: string): Promise<void> {
	if (name.includes(":")) throw new Error("node names cannot contain ':'");
	if (name === resolveNodeName())
		throw new Error(`${name} is this node; link to a different node`);
	const others = readLinks().filter((link) => link.name !== name);
	await writeLinks([...others, { name, url: parseLinkUrl(url) }]);
	console.log(chalk.green(`Linked ${name} (${parseLinkUrl(url)})`));
}
