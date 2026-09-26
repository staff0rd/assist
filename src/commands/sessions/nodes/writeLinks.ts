import {
	loadGlobalConfigRaw,
	saveGlobalConfig,
} from "../../../shared/loadConfig";
import { validateConfig } from "../../config/validateConfig";
import { isDaemonRunning } from "../daemon/connectToDaemon";
import type { LinkSpec } from "../daemon/links/LinkStatus";
import { sendToDaemon } from "../daemon/sendToDaemon";

export function readLinks(): LinkSpec[] {
	const sessions = loadGlobalConfigRaw().sessions as
		| { links?: LinkSpec[] }
		| undefined;
	return sessions?.links ?? [];
}

export async function writeLinks(links: LinkSpec[]): Promise<void> {
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
