import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { readLinks } from "../../nodes/readLinks";
import { reloadDaemonLinks } from "../../nodes/reloadDaemonLinks";
import { writeLinks } from "../../nodes/writeLinks";
import { readJsonBody } from "../readJsonBody";

async function readName(req: IncomingMessage): Promise<string | null> {
	try {
		const { name } = ((await readJsonBody(req)) ?? {}) as { name?: unknown };
		return typeof name === "string" && name ? name : null;
	} catch {
		return null;
	}
}

export async function postNodeUnlink(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const name = await readName(req);
	if (!name) {
		respondJson(res, 400, { error: "Missing node name" });
		return;
	}
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
