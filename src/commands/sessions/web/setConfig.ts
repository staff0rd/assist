import type { IncomingMessage, ServerResponse } from "node:http";
import { coerceConfigValue } from "../../config/coerceConfigValue";
import { restoreConfigWriteSecrets } from "../../config/restoreConfigWriteSecrets";
import { applyScopedConfigSet } from "./applyScopedConfigSet";
import { handleConfigWrite } from "./handleConfigWrite";

export function setConfig(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	return handleConfigWrite(req, res, (request) => {
		const coerced = coerceConfigValue(
			request.key,
			restoreConfigWriteSecrets(request.key, request.value, request.cwd),
		);
		if (!coerced.ok) return { ok: false, errors: [coerced.error] };

		return applyScopedConfigSet(
			request.key,
			coerced.value,
			request.cwd,
			request.scope,
		);
	});
}
