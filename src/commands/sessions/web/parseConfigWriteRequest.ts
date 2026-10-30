import type { IncomingMessage } from "node:http";
import {
	type ConfigWriteScope,
	isConfigWriteScope,
} from "../../config/ConfigWriteScope";
import { readJsonBody } from "./readJsonBody";

type ConfigWriteBody = {
	key?: unknown;
	value?: unknown;
	cwd?: unknown;
	scope?: unknown;
};

type ParsedConfigWriteRequest =
	| {
			ok: true;
			key: string;
			value: unknown;
			cwd: string;
			scope: ConfigWriteScope;
	  }
	| { ok: false; error: string };

export async function parseConfigWriteRequest(
	req: IncomingMessage,
): Promise<ParsedConfigWriteRequest> {
	let body: ConfigWriteBody;
	try {
		body = (await readJsonBody(req)) as ConfigWriteBody;
	} catch {
		return { ok: false, error: "Invalid JSON body" };
	}

	const { key, cwd, scope } = body;
	if (typeof key !== "string" || key === "")
		return { ok: false, error: "Missing key" };
	if (typeof cwd !== "string" || cwd === "")
		return { ok: false, error: "Missing cwd" };
	if (!isConfigWriteScope(scope))
		return {
			ok: false,
			error: 'scope must be "project", "repo", "global" or "user"',
		};

	return { ok: true, key, value: body.value, cwd, scope };
}
