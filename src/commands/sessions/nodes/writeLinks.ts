import {
	loadGlobalConfigRaw,
	saveGlobalConfig,
} from "../../../shared/loadConfig";
import { validateConfig } from "../../config/validateConfig";
import type { LinkSpec } from "../daemon/links/LinkStatus";

export async function writeLinks(links: LinkSpec[]): Promise<void> {
	const config = loadGlobalConfigRaw();
	const sessions = { ...(config.sessions as Record<string, unknown>) };
	if (links.length > 0) sessions.links = links;
	else delete sessions.links;
	const updated = { ...config, sessions };
	const validation = validateConfig(updated, "sessions.links");
	if (!validation.ok) throw new Error(validation.errors.join("\n"));
	saveGlobalConfig(updated);
}
