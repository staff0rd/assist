import {
	loadGlobalConfigRaw,
	saveGlobalConfig,
} from "../../../shared/loadConfig";
import { validateConfig } from "../../config/validateConfig";
import { isDaemonRunning } from "../daemon/connectToDaemon";
import { sendToDaemon } from "../daemon/sendToDaemon";
import type { LinkConfig } from "../shared/loadLinkSpecs";

export function readLinks(): LinkConfig[] {
	const sessions = loadGlobalConfigRaw().sessions as
		| { links?: LinkConfig[] }
		| undefined;
	return sessions?.links ?? [];
}

export async function writeLinks(links: LinkConfig[]): Promise<void> {
	const config = loadGlobalConfigRaw();
	const sessions = { ...(config.sessions as Record<string, unknown>) };
	if (links.length > 0) sessions.links = links;
	else delete sessions.links;
	const updated = { ...config, sessions };
	const validation = validateConfig(updated, "sessions.links");
	if (!validation.ok) throw new Error(validation.errors.join("\n"));
	saveGlobalConfig(updated);
	if (await isDaemonRunning()) await sendToDaemon({ type: "reload-links" });
}
