import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { RUN_APPROVAL_TIMEOUT_MS } from "../../../extension/browserLink/types";
import { readJsonBody } from "../readJsonBody";
import { browserLink } from "./browserLink";
import { parseBrowserRequest } from "./parseBrowserRequest";

const RELAY_TIMEOUT_MS = 10_000;
const RUN_RELAY_TIMEOUT_MS = RUN_APPROVAL_TIMEOUT_MS + 30_000;

export async function browserRelay(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	if (req.headers.origin) {
		respondJson(res, 403, { error: "browser relay is CLI-only" });
		return;
	}
	const request = parseBrowserRequest(
		await readJsonBody(req).catch(() => undefined),
	);
	if (!request) {
		respondJson(res, 400, { error: "Invalid browser request" });
		return;
	}
	try {
		const timeoutMs =
			request.op === "run" ? RUN_RELAY_TIMEOUT_MS : RELAY_TIMEOUT_MS;
		respondJson(res, 200, await browserLink.request(request, timeoutMs));
	} catch (error) {
		const status = (error as { status?: number }).status ?? 500;
		respondJson(res, status, {
			error: error instanceof Error ? error.message : String(error),
		});
	}
}
