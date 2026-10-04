import chalk from "chalk";
import { resolveNodeName } from "../shared/resolveNodeName";
import { notifyDaemonLinks } from "./notifyDaemonLinks";
import { readLinks } from "./readLinks";
import { writeLinks } from "./writeLinks";
import { buildLink, type LinkOptions } from "./buildLink";

export async function linkNode(
	name: string,
	url: string | undefined,
	options: LinkOptions,
): Promise<void> {
	if (name.includes(":")) throw new Error("node names cannot contain ':'");
	const others = (await readLinks()).filter((link) => link.name !== name);
	if (name === resolveNodeName())
		throw new Error(`${name} is this node; link to a different node`);
	const link = await buildLink(name, url, options);
	await writeLinks([...others, link]);
	console.log(chalk.green(`Linked ${name} (${link.url})`));
	await notifyDaemonLinks();
}
