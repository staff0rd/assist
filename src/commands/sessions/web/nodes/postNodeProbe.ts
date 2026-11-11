import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { probePeer } from "./probePeer";
import { readBodyFields } from "./readBodyFields";

export async function postNodeProbe(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const fields = await readBodyFields(req, ["url"]);
	if (!fields) {
		respondJson(res, 400, { error: "Enter the peer's web server URL" });
		return;
	}
	const result = await probePeer(fields.url);
	if (!result.ok) {
		respondJson(res, 422, { error: result.error });
		return;
	}
	const { name, version, url } = result;
	respondJson(res, 200, { name, version, url });
}
