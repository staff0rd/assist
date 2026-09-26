import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import type { ConfigWriteScope } from "../../config/ConfigWriteScope";
import { parseConfigWriteRequest } from "./parseConfigWriteRequest";

type ConfigWriteRequest = {
	key: string;
	value: unknown;
	cwd: string;
	scope: ConfigWriteScope;
};

type ConfigWriteResult =
	| { ok: true; payload: Record<string, unknown> }
	| { ok: false; errors: string[] };

export async function handleConfigWrite(
	req: IncomingMessage,
	res: ServerResponse,
	apply: (request: ConfigWriteRequest) => ConfigWriteResult,
): Promise<void> {
	const parsed = await parseConfigWriteRequest(req);
	if (!parsed.ok) {
		respondJson(res, 400, { error: parsed.error });
		return;
	}

	try {
		const result = apply(parsed);
		if (!result.ok) {
			respondJson(res, 400, {
				error: result.errors.join("\n"),
				errors: result.errors,
			});
			return;
		}
		respondJson(res, 200, result.payload);
	} catch (error) {
		respondJson(res, 500, {
			error: error instanceof Error ? error.message : "Failed to save config",
		});
	}
}
