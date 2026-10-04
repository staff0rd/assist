import chalk from "chalk";
import { loadGlobalConfigRaw } from "../../../shared/loadConfig";
import { SSH_LINK_RETIRED } from "../../../shared/sessionLinkSchema";
import type { LinkSpec } from "../daemon/links/LinkStatus";
import { writeLinks } from "./writeLinks";

type StoredLink = { name: string; url?: string };

export async function readLinks(): Promise<LinkSpec[]> {
	const sessions = loadGlobalConfigRaw().sessions as
		| { links?: StoredLink[] }
		| undefined;
	const stored = sessions?.links ?? [];
	const links = stored.filter((link): link is LinkSpec => !!link.url);
	if (links.length === stored.length) return links;
	await writeLinks(links);
	const dropped = stored.filter((link) => !link.url).map((link) => link.name);
	console.log(
		chalk.yellow(`Removed ${dropped.join(", ")}: ${SSH_LINK_RETIRED}`),
	);
	return links;
}
