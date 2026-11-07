import type { IncomingMessage } from "node:http";
import { readJsonBody } from "./readJsonBody";

type ParsedAddTesterRequest =
	| { ok: true; email: string; internal: boolean }
	| { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function parseAddTesterRequest(
	req: IncomingMessage,
): Promise<ParsedAddTesterRequest> {
	let body: { email?: unknown; internal?: unknown };
	try {
		body = ((await readJsonBody(req)) ?? {}) as typeof body;
	} catch {
		return { ok: false, error: "Invalid JSON body" };
	}

	const email = typeof body.email === "string" ? body.email.trim() : "";
	if (!EMAIL_PATTERN.test(email))
		return { ok: false, error: "email must be a valid email address" };
	if (body.internal !== undefined && typeof body.internal !== "boolean")
		return { ok: false, error: "internal must be a boolean" };

	return { ok: true, email, internal: body.internal ?? false };
}
