import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { allowExtensionOrigin } from "../fromGithub/allowExtensionOrigin";
import { readJsonBody } from "../readJsonBody";
import { linkStatusSchema } from "./linkStatusSchema";
import { resolveLinkStates } from "./resolveLinkStates";

export async function linkStatus(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	allowExtensionOrigin(req, res);
	const parsed = linkStatusSchema.safeParse(
		await readJsonBody(req).catch(() => undefined),
	);
	if (!parsed.success) {
		respondJson(res, 400, { error: "Invalid link status body" });
		return;
	}
	respondJson(res, 200, { states: await resolveLinkStates(parsed.data.refs) });
}
