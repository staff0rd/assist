import chalk from "chalk";
import { describeTarget } from "../daemon/links/describeTarget";
import {
	defaultTunnelPort,
	type LinkConfig,
	toLinkSpec,
} from "../shared/loadLinkSpecs";
import { resolveNodeName } from "../shared/resolveNodeName";
import { readLinks, writeLinks } from "./writeLinks";

type LinkOptions = { ssh?: string; port?: string; localPort?: string };

function parseLinkUrl(url: string): string {
	const parsed = new URL(url);
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
		throw new Error(`link url must be http(s): ${url}`);
	return parsed.origin;
}

function parsePort(flag: string, value: string | undefined): number {
	const port = Number(value);
	if (!Number.isInteger(port) || port < 1 || port > 65_535)
		throw new Error(`${flag} must be a port number, got ${value}`);
	return port;
}

function freeTunnelPort(port: number, others: LinkConfig[]): number {
	const taken = new Set(others.map((link) => toLinkSpec(link).ssh?.localPort));
	let candidate = defaultTunnelPort(port);
	while (taken.has(candidate)) candidate++;
	return candidate;
}

export function buildLink(
	name: string,
	url: string | undefined,
	options: LinkOptions,
	others: LinkConfig[],
): LinkConfig {
	if (url && options.ssh)
		throw new Error("pass either <url> or --ssh <alias>, not both");
	if (url) return { name, url: parseLinkUrl(url) };
	if (!options.ssh)
		throw new Error("pass the peer's <url> or --ssh <alias> --port <port>");
	const port = parsePort("--port", options.port);
	const localPort = options.localPort
		? parsePort("--local-port", options.localPort)
		: freeTunnelPort(port, others);
	return { name, ssh: options.ssh, port, localPort };
}

export async function linkNode(
	name: string,
	url: string | undefined,
	options: LinkOptions,
): Promise<void> {
	if (name.includes(":")) throw new Error("node names cannot contain ':'");
	if (name === resolveNodeName())
		throw new Error(`${name} is this node; link to a different node`);
	const others = readLinks().filter((link) => link.name !== name);
	const link = buildLink(name, url, options, others);
	await writeLinks([...others, link]);
	console.log(
		chalk.green(`Linked ${name} (${describeTarget(toLinkSpec(link))})`),
	);
}
