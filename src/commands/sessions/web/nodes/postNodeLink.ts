import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { readLinks } from "../../nodes/readLinks";
import { reloadDaemonLinks } from "../../nodes/reloadDaemonLinks";
import { writeLinks } from "../../nodes/writeLinks";
import { linkConflict } from "./linkConflict";
import { tryParseLinkUrl } from "./tryParseLinkUrl";
import { readBodyFields } from "./readBodyFields";

export async function postNodeLink(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const fields = await readBodyFields(req, ["name", "url"]);
	const url = fields && tryParseLinkUrl(fields.url);
	if (!fields || !url) {
		respondJson(res, 400, { error: "Missing node name or http(s) URL" });
		return;
	}
	const links = await readLinks();
	const conflict = linkConflict(fields.name, url, links);
	if (conflict) {
		respondJson(res, 409, { error: conflict });
		return;
	}
	await writeLinks([...links, { name: fields.name, url }]);
	const daemon = await reloadDaemonLinks();
	console.log(`nodes: linked ${fields.name} (${url}); daemon ${daemon.kind}`);
	respondJson(res, 200, { ok: true, daemon });
}
