import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import {
	type BrowserRequest,
	RUN_APPROVAL_TIMEOUT_MS,
} from "../../../extension/browserLink/types";
import { readJsonBody } from "../readJsonBody";
import { browserLink } from "./browserLink";

const RELAY_TIMEOUT_MS = 10_000;
const RUN_RELAY_TIMEOUT_MS = RUN_APPROVAL_TIMEOUT_MS + 30_000;

function optionalString(value: unknown): value is string | undefined {
	return value === undefined || typeof value === "string";
}

function parseBrowserRequest(body: unknown): BrowserRequest | undefined {
	const { op, url, selector, text, code } = (body ?? {}) as Record<
		string,
		unknown
	>;
	if (!optionalString(url)) return undefined;
	if (op === "status" || op === "snapshot") return { op, url };
	if (op === "run")
		return typeof code === "string" && code.trim()
			? { op, url, code }
			: undefined;
	if (op !== "inspect") return undefined;
	if (typeof selector === "string" && selector) return { op, url, selector };
	if (typeof text === "string" && text) return { op, url, text };
	return undefined;
}

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
