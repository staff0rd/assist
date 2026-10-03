import chalk from "chalk";
import { describeTarget } from "../daemon/links/describeTarget";
import { toLinkSpec } from "../shared/loadLinkSpecs";
import { resolveNodeName } from "../shared/resolveNodeName";
import { notifyDaemonLinks } from "./notifyDaemonLinks";
import { readLinks, writeLinks } from "./writeLinks";
import { buildLink, type LinkOptions } from "./buildLink";

export async function linkNode(
	name: string,
	url: string | undefined,
	options: LinkOptions,
): Promise<void> {
	if (name.includes(":")) throw new Error("node names cannot contain ':'");
	if (name === resolveNodeName())
		throw new Error(`${name} is this node; link to a different node`);
	const others = readLinks().filter((link) => link.name !== name);
	const link = await buildLink(name, url, options, others);
	await writeLinks([...others, link]);
	console.log(
		chalk.green(`Linked ${name} (${describeTarget(toLinkSpec(link))})`),
	);
	await notifyDaemonLinks();
}
