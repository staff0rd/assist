import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { readLinks } from "../../nodes/readLinks";
import { reloadDaemonLinks } from "../../nodes/reloadDaemonLinks";
import { writeLinks } from "../../nodes/writeLinks";
import { readBodyFields } from "./readBodyFields";

export async function postNodeUnlink(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const fields = await readBodyFields(req, ["name"]);
	if (!fields) {
		respondJson(res, 400, { error: "Missing node name" });
		return;
	}
	const { name } = fields;
	const links = await readLinks();
	const remaining = links.filter((link) => link.name !== name);
	if (remaining.length === links.length) {
		respondJson(res, 404, { error: `No link named ${name}` });
		return;
	}
	await writeLinks(remaining);
	const daemon = await reloadDaemonLinks();
	console.log(`nodes: unlinked ${name}; daemon ${daemon.kind}`);
	respondJson(res, 200, { ok: true, daemon });
}
